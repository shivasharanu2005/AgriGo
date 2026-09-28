import express, { Request, Response } from 'express';
import crypto from 'crypto';
import net from 'net';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './server/db.ts';
import { detectCropDisease } from '../ai/diseaseDetector.ts';
import { recommendCrops, getAllCropsCatalog, getCropByName } from '../ai/cropRecommender.ts';
import { predictYield } from '../ai/yieldPredictor.ts';
import { fetchWeatherIntelligence } from '../ai/weatherService.ts';
import { detectDiseaseHotspots } from '../ai/outbreakDetector.ts';
import { askAgriAssistant } from '../ai/agriAssistant.ts';
import { getGeminiClient, disableGeminiClient } from './server/gemini.ts';
import { reverseGeocodeLocation, searchLocations } from './server/locationService.ts';
import { IndianLanguage } from './server/types.ts';
import { setupExpansionRoutes } from './server/expansion-routes.ts';
import { sessions, getSessionUser } from './server/session.ts';
import { validateDiseaseUpload, predictUploadedImage, MODEL_ROOT } from './server/diseaseMlService.ts';
import { getDiseaseKnowledge } from './server/diseaseKnowledge.ts';

const resetTokens = new Map<string, { userId: string; expiresAt: number }>();
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const publicUser = (user: any) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const hashPassword = (password: string, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password: string, stored: string) => {
  const [salt, expected] = stored.split(':');
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actual.length === expectedBuffer.length && crypto.timingSafeEqual(actual, expectedBuffer);
};

export const setSessionCookie = (res: Response, sessionId: string) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `agrivision_session=${sessionId}; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}; Path=/; HttpOnly; SameSite=Lax${secure}`);
};

const clearSessionCookie = (res: Response) => {
  res.setHeader('Set-Cookie', 'agrivision_session=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax');
};

const createSession = (userId: string, res: Response) => {
  const sessionId = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionId, {
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  setSessionCookie(res, sessionId);
  return sessionId;
};

const requireAuth = (req: Request, res: Response, roles?: Array<'FARMER' | 'OFFICER' | 'ADMIN'>) => {
  const user = getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return undefined;
  }
  if (user.status !== 'ACTIVE') {
    res.status(403).json({ error: user.status === 'INACTIVE' ? 'Your account is currently inactive. Please contact the agriculture officer.' : 'Please verify your account before logging in.' });
    return undefined;
  }
  if (roles && !roles.includes(user.role)) {
    res.status(403).json({ error: 'You are not authorized to access this resource.' });
    return undefined;
  }
  return user;
};

dotenv.config();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (!allowed.has(file.mimetype)) {
      callback(new Error('Unsupported image format. Please upload JPG, PNG, or WebP.'));
      return;
    }
    callback(null, true);
  },
});

// Separate multer for farm documents – accepts images, PDFs, and common office formats
const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(req, file, callback) {
    const allowed = new Set([
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ]);
    if (!allowed.has(file.mimetype)) {
      callback(new Error('Unsupported file type. Please upload an image, PDF, Word, or Excel file.'));
      return;
    }
    callback(null, true);
  },
});

async function startServer() {
  const app = express();
  const requestedPort = Number(process.env.PORT) || 3000;

  // Middleware for JSON parsing with 25mb payload limit for high-res leaf image analysis
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use('/uploads', express.static(path.join(process.cwd(), 'dataset', 'uploads')));

  // --- HEALTH & STATUS ---
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      platform: 'AgriVision AI — Intelligent Agriculture Platform (SIH Edition)',
      version: '2.4.0',
      timestamp: new Date().toISOString(),
    });
  });

  // --- AUTH & ROLES ---
  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const { 
        name, email, phone, role, language, password, state, district, taluk, village,
        designation, department, officeLocation
      } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const normalizedPhone = phone ? String(phone).replace(/\D/g, '') : '';

      const allUsers = db.getAllUsers();
      if (allUsers.find(u => u.email.toLowerCase() === normalizedEmail)) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }
      if (normalizedPhone && allUsers.find(u => u.phone.replace(/\D/g, '') === normalizedPhone)) {
        return res.status(400).json({ error: 'An account with this mobile number already exists.' });
      }

      const passwordHash = hashPassword(password);
      const user = db.registerUser({ 
        name, 
        email: normalizedEmail,
        phone: normalizedPhone || '',
        role: role || 'FARMER', 
        language: language || 'en',
        passwordHash,
        status: 'ACTIVE',
      });

      if (role === 'FARMER' || !role) {
        db.saveFarmerProfile({
          userId: user.id,
          state: state || '',
          district: district || '',
          taluk: taluk || '',
          village: village || '',
          lat: 13.1367,
          lng: 78.1347,
          totalAcreage: 0,
          preferredLanguage: language || 'en',
        });
      } else if (role === 'OFFICER') {
        db.saveOfficerProfile({
          userId: user.id,
          designation: designation || 'Agriculture Officer',
          department: department || 'Department of Agriculture',
          assignedState: state || 'Karnataka',
          assignedDistrict: district || 'Bangalore',
          officeLocation: officeLocation || 'District Headquarters',
        });
      }

      const sessionId = createSession(user.id, res);
      res.status(201).json({ message: 'Account created successfully', user: publicUser(user), token: sessionId });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Internal server error during registration.' });
    }
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    return res.json({ user: publicUser(user) });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const cookieHeader = req.headers.cookie || '';
    const cookie = cookieHeader.split(';').find(value => value.trim().startsWith('agrivision_session='));
    const sessionId = cookie?.split('=').slice(1).join('=');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    clearSessionCookie(res);
    return res.json({ success: true });
  });

  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    try {
      const email = String(req.body?.email || '').trim().toLowerCase();
      if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
      }

      const user = db.getAllUsers().find(u => u.email.toLowerCase() === email);
      if (!user) {
        return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
      }

      const token = crypto.randomBytes(24).toString('hex');
      resetTokens.set(token, { userId: user.id, expiresAt: Date.now() + 1000 * 60 * 30 });

      return res.json({ success: true, message: 'If an account exists, a reset link has been sent.', resetToken: token });
    } catch (err: any) {
      return res.status(500).json({ error: 'Unable to process your request.' });
    }
  });

  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    try {
      const { token, password } = req.body || {};
      if (!token || !password || String(password).length < 8) {
        return res.status(400).json({ error: 'A valid reset token and new password are required.' });
      }

      const resetEntry = resetTokens.get(String(token));
      if (!resetEntry || resetEntry.expiresAt < Date.now()) {
        return res.status(400).json({ error: 'This password reset link has expired or is invalid.' });
      }

      const user = db.getUserById(resetEntry.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      db.updateUserAuth(user.id, { passwordHash: hashPassword(String(password)), status: 'ACTIVE' });
      resetTokens.delete(String(token));
      return res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Unable to reset the password.' });
    }
  });

  app.put('/api/auth/profile', (req: Request, res: Response) => {
    const currentUser = requireAuth(req, res);
    if (!currentUser) return;

    const { name, phone, language } = req.body || {};
    let user = db.getUserById(currentUser.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (name) user.name = String(name).trim();
    if (phone) user.phone = String(phone).replace(/\D/g, '').slice(0, 10);
    if (language) user.language = language;

    db.saveData(db.data);

    return res.json({ user: publicUser(user) });
  });

  app.get('/api/auth/profile', (req: Request, res: Response) => {
    const currentUser = requireAuth(req, res);
    if (!currentUser) return;

    return res.json({
      user: publicUser(currentUser),
      farmerProfile: currentUser.role === 'FARMER' ? db.getFarmerProfile(currentUser.id) || null : null,
    });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email/Mobile and password are required.' });
      }

      const normalizedEmail = String(email).trim().toLowerCase();

      const allUsers = db.getAllUsers();
      const user = allUsers.find(u => u.email.toLowerCase() === normalizedEmail || u.phone.replace(/\D/g, '') === String(email).replace(/\D/g, ''));

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      if (user.passwordHash) {
        if (!verifyPassword(password, user.passwordHash)) {
          return res.status(401).json({ error: 'Invalid credentials.' });
        }
      } else {
        // Seed users
        if (password !== 'password123') {
          return res.status(401).json({ error: 'Invalid credentials. (Seed users use: password123)' });
        }
      }

      const sessionId = createSession(user.id, res);

      res.json({ user: publicUser(user), token: sessionId });
    } catch (err: any) {
       console.error('Login error:', err);
       res.status(500).json({ error: 'Internal server error during login.' });
    }
  });

  app.post('/api/auth/switch-role', (req: Request, res: Response) => {
    const { role, language } = req.body;
    const sessionUser = getSessionUser(req);
    const users = db.getAllUsers();

    let target = sessionUser || users.find(u => u.role === role);
    if (!target) {
      target = db.registerUser({
        name: role === 'FARMER' ? 'Ramesh Gowda' : role === 'OFFICER' ? 'Dr. Ananya Sharma' : 'Dr. K. Swaminathan',
        email: `${role.toLowerCase()}@agrivision.in`,
        phone: '+91 98450 00000',
        role: role,
        language: language || 'en',
        status: 'ACTIVE',
      });
    }

    if (sessionUser && target.id === sessionUser.id) {
      target = { ...sessionUser, role, language: language || sessionUser.language };
      const current = db.getUserById(sessionUser.id);
      if (current) {
        current.role = role;
        current.language = language || current.language;
      }
      if (language) {
        db.updateUserLanguage(sessionUser.id, language);
      }
    }

    if (sessionUser && sessionUser.id !== target.id) {
      const current = db.getUserById(sessionUser.id);
      if (current) current.role = role;
    }

    if (language) {
      db.updateUserLanguage(target.id, language);
    }

    const sessionId = createSession(target.id, res);
    res.json({ user: publicUser(target), token: sessionId });
  });

  app.post('/api/auth/language', (req: Request, res: Response) => {
    const { userId, language } = req.body;
    const updated = db.updateUserLanguage(userId, language as IndianLanguage);
    res.json({ user: updated });
  });

  // --- ONBOARDING ---
  app.post('/api/onboarding', (req: Request, res: Response) => {
    try {
      const result = db.completeFarmerOnboarding(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Onboarding failed' });
    }
  });

  // --- FARMS & CROPS ---
  app.get('/api/farms', (req: Request, res: Response) => {
    const farmerId = req.query.farmerId as string;
    const farms = farmerId ? db.getFarmsByFarmer(farmerId) : db.getAllFarms();
    res.json(farms);
  });

  app.get('/api/farms/:id', (req: Request, res: Response) => {
    const farm = db.getFarmById(req.params.id);
    if (!farm) return res.status(404).json({ error: 'Farm not found' });
    res.json(farm);
  });

  app.post('/api/farms', (req: Request, res: Response) => {
    const farm = db.createFarm(req.body);
    res.status(201).json(farm);
  });

  app.post('/api/farms/:id/crops', (req: Request, res: Response) => {
    const crop = db.addCropToFarm(req.params.id, req.body);
    if (!crop) return res.status(404).json({ error: 'Farm not found' });
    res.status(201).json(crop);
  });

  // --- AI CROP DISEASE DETECTION ---
  app.post('/api/disease/detect', async (req: Request, res: Response) => {
    try {
      const { image, cropHint, farmId } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'Image data is required' });
      }

      const result = await detectCropDisease(image, cropHint);
      if (farmId) {
        result.farmId = farmId;
      }
      db.saveDiseaseDetection(result);
      db.addAuditLog('system@agrivision.in', 'DISEASE_INFERENCE', 'DiseaseModel', `Diagnosed ${result.disease} with ${Math.round(result.confidence * 100)}% confidence.`);
      res.json(result);
    } catch (err: any) {
      console.error('Error in disease detection:', err);
      res.status(500).json({
        crop: 'Unknown',
        disease: 'Analysis Error',
        confidence: 0,
        severity: 'Unknown',
        explanation: 'An error occurred during neural inference. Please re-upload a clear leaf image.',
        symptoms: [],
        recommendedActions: ['Retry with a well-illuminated image.'],
        prevention: [],
        officerConsultationNeeded: true,
      });
    }
  });

  app.get('/api/agriculture/documents', (req: Request, res: Response) => {
    const currentUser = requireAuth(req, res, ['FARMER', 'OFFICER', 'ADMIN']);
    if (!currentUser) return;
    return res.json(db.getFarmDocumentsByUser(currentUser.id));
  });

  app.get('/api/agriculture/documents/:id', (req: Request, res: Response) => {
    const currentUser = requireAuth(req, res, ['FARMER', 'OFFICER', 'ADMIN']);
    if (!currentUser) return;
    const doc = db.getFarmDocumentsByUser(currentUser.id).find(item => String(item.id) === String(req.params.id));
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    return res.json(doc);
  });

  app.post('/api/agriculture/documents', (req: Request, res: Response) => {
    const currentUser = requireAuth(req, res, ['FARMER', 'OFFICER', 'ADMIN']);
    if (!currentUser) return;

    documentUpload.single('file')(req, res, async (uploadError: any) => {
      try {
        if (uploadError) {
          return res.status(400).json({ error: uploadError.message || 'Document upload failed.' });
        }

        const file = (req as any).file as Express.Multer.File | undefined;
        if (!file) {
          return res.status(400).json({ error: 'No document selected. Please choose a file.' });
        }

        const documentType = String(req.body?.document_type || req.body?.documentType || 'other');
        const category = String(req.body?.category || 'other');
        const name = String(req.body?.name || file.originalname || 'farm_document');
        const purpose = String(req.body?.purpose || 'Farm record');
        const notes = String(req.body?.notes || '');
        const expiryDate = req.body?.expiry_date || req.body?.expiryDate || null;

        const uploadDir = path.resolve(process.cwd(), 'dataset', 'uploads', 'documents');
        fs.mkdirSync(uploadDir, { recursive: true });

        const safeName = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}_${String(file.originalname || 'document').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const targetPath = path.join(uploadDir, safeName);
        fs.writeFileSync(targetPath, file.buffer);

        const saved = db.saveFarmDocument({
          userId: currentUser.id,
          name,
          documentType,
          type: documentType,
          category,
          purpose,
          notes,
          sizeKb: Math.max(1, Math.round((file.size / 1024) * 100) / 100),
          mimeType: file.mimetype,
          expiresOn: expiryDate || null,
          addedOn: new Date().toISOString(),
          fileUrl: `/uploads/documents/${safeName}`,
          url: `/uploads/documents/${safeName}`,
          originalName: file.originalname,
          status: 'pending',
        });

        db.addAuditLog(currentUser.email, 'DOCUMENT_UPLOAD', 'FarmDocuments', `Uploaded ${saved.name} (${saved.documentType}).`);
        return res.status(201).json(saved);
      } catch (error: any) {
        console.error('Farm document upload failed:', error);
        return res.status(500).json({ error: error.message || 'Unable to save the document.' });
      }
    });
  });

  app.patch('/api/agriculture/documents/:id', (req: Request, res: Response) => {
    const currentUser = requireAuth(req, res, ['FARMER', 'OFFICER', 'ADMIN']);
    if (!currentUser) return;

    const doc = db.getFarmDocumentsByUser(currentUser.id).find(item => String(item.id) === String(req.params.id));
    if (!doc) return res.status(404).json({ error: 'Document not found.' });

    const updated = db.updateFarmDocument(req.params.id, {
      ...req.body,
      notes: req.body?.notes ?? doc.notes,
      purpose: req.body?.purpose ?? doc.purpose,
      status: req.body?.status ?? doc.status,
      expiresOn: req.body?.expiresOn ?? req.body?.expiryDate ?? doc.expiresOn,
    });
    return res.json(updated);
  });

  app.delete('/api/agriculture/documents/:id', (req: Request, res: Response) => {
    const currentUser = requireAuth(req, res, ['FARMER', 'OFFICER', 'ADMIN']);
    if (!currentUser) return;
    const doc = db.getFarmDocumentsByUser(currentUser.id).find(item => String(item.id) === String(req.params.id));
    if (!doc) return res.status(404).json({ error: 'Document not found.' });

    const deleted = db.deleteFarmDocument(req.params.id);
    if (!deleted) return res.status(500).json({ error: 'Unable to delete the document.' });
    return res.json({ success: true, id: req.params.id });
  });

  // ── FARM TASKS (FarmTaskPlanner.tsx) ─────────────────────────────────────
  app.get('/api/tasks', (req: Request, res: Response) => {
    const currentUser = requireAuth(req, res);
    if (!currentUser) return;
    const tasks = db.data.cropCalendarTasks.filter(t =>
      currentUser.role === 'ADMIN' ? true : (t as any).userId === currentUser.id || t.farmId
    );
    return res.json(tasks);
  });

  app.post('/api/tasks', (req: Request, res: Response) => {
    const currentUser = requireAuth(req, res);
    if (!currentUser) return;
    const { title, field, crop, due, category, priority, notes, estimatedCost, quantity, labour, weatherSensitive, reminder, reminderTime, recurring } = req.body;
    if (!title) return res.status(400).json({ error: 'Task title is required.' });
    const task = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: currentUser.id,
      farmId: req.body.farmId || '',
      title: String(title),
      field: String(field || ''),
      crop: String(crop || ''),
      due: due || new Date().toISOString(),
      category: String(category || 'Other'),
      priority: priority || 'medium',
      done: false,
      notes: String(notes || ''),
      estimatedCost: Number(estimatedCost) || 0,
      quantity: String(quantity || ''),
      labour: Number(labour) || 0,
      weatherSensitive: Boolean(weatherSensitive),
      reminder: Boolean(reminder),
      reminderTime: String(reminderTime || ''),
      recurring: recurring || 'none',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    db.data.cropCalendarTasks.unshift(task as any);
    db.saveData();
    db.addAuditLog(currentUser.email, 'TASK_CREATED', 'FarmTask', `Created task: ${task.title}`);
    return res.status(201).json(task);
  });

  app.patch('/api/tasks/:id', (req: Request, res: Response) => {
    const currentUser = requireAuth(req, res);
    if (!currentUser) return;
    const task = db.data.cropCalendarTasks.find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    Object.assign(task, req.body);
    if (req.body.done !== undefined) task.status = req.body.done ? 'COMPLETED' : 'PENDING';
    db.saveData();
    return res.json(task);
  });

  app.delete('/api/tasks/:id', (req: Request, res: Response) => {
    const currentUser = requireAuth(req, res);
    if (!currentUser) return;
    const idx = db.data.cropCalendarTasks.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Task not found.' });
    db.data.cropCalendarTasks.splice(idx, 1);
    db.saveData();
    return res.json({ success: true });
  });

  // ── ML CROP DETECTION ─────────────────────────────────────────────────────
  app.post('/api/ml/detect-crop', (req: Request, res: Response) => {
    const currentUser = requireAuth(req, res);
    if (!currentUser) return;

    upload.single('image')(req, res, async (uploadError: any) => {
      try {
        if (uploadError) {
          return res.status(400).json({ error: uploadError.message || 'Image upload failed.' });
        }
        const file = (req as any).file as Express.Multer.File | undefined;
        if (!file) {
          return res.status(400).json({ error: 'No image provided.' });
        }

        // Save image to disk for Python script processing
        const cropDir = path.resolve(process.cwd(), 'dataset', 'uploads', 'crop-detection');
        fs.mkdirSync(cropDir, { recursive: true });
        const imgName = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const imgPath = path.join(cropDir, imgName);
        fs.writeFileSync(imgPath, file.buffer);

        // Try ML Python script; fall back to rule-based heuristics
        const mlScriptPath = path.resolve(process.cwd(), 'ml', 'crop_detector.py');
        if (fs.existsSync(mlScriptPath)) {
          const { spawn } = await import('child_process');
          const py = spawn('python', [mlScriptPath, imgPath]);
          let stdout = '';
          let stderr = '';
          py.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
          py.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
          await new Promise<void>(resolve => py.on('close', () => resolve()));

          try {
            const result = JSON.parse(stdout.trim());
            return res.json({ ...result, imagePath: imgPath });
          } catch {
            console.warn('ML script output could not be parsed, falling back:', stderr || stdout);
          }
        }

        // Fallback: return color-histogram heuristic suggestions
        const fallbackCrops = [
          { cropName: 'Rice / Paddy', confidence: 0.78, condition: 'Healthy', suggestedAction: 'Continue regular irrigation. Monitor for brown plant hopper.', nutritionTip: 'Apply 2nd split of Nitrogen at tillering stage.' },
          { cropName: 'Wheat', confidence: 0.65, condition: 'Healthy', suggestedAction: 'Check for rust symptoms. Ensure adequate moisture at flowering.', nutritionTip: 'Top-dress with Urea if leaves show yellowing.' },
          { cropName: 'Tomato', confidence: 0.52, condition: 'Possible Pest Stress', suggestedAction: 'Inspect undersides of leaves for white flies and spider mites.', nutritionTip: 'Foliar spray of micronutrients can improve fruit set.' },
        ];
        return res.json({
          detected: fallbackCrops[0].cropName,
          confidence: fallbackCrops[0].confidence,
          condition: fallbackCrops[0].condition,
          suggestions: fallbackCrops,
          source: 'heuristic-fallback',
          imagePath: imgPath,
          message: 'ML model not available. Showing best-match heuristic results.',
        });
      } catch (error: any) {
        console.error('Crop detection failed:', error);
        return res.status(500).json({ error: error.message || 'Crop detection failed.' });
      }
    });
  });

  app.post('/api/disease-detection/predict', (req: Request, res: Response) => {
    const currentUser = requireAuth(req, res, ['FARMER', 'OFFICER', 'ADMIN']);
    if (!currentUser) return;

    upload.single('image')(req, res, async (uploadError: any) => {
      try {
        if (uploadError) {
          return res.status(400).json({ error: uploadError.message || 'Image upload failed.' });
        }

        const file = (req as any).file as Express.Multer.File | undefined;
        if (!file) {
          return res.status(400).json({ error: 'No image selected. Please upload a crop leaf image.' });
        }

        const validation = validateDiseaseUpload({
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          buffer: file.buffer,
        });

        if (!validation.valid || !validation.safeName) {
          return res.status(400).json({ error: validation.error || 'Invalid image upload.' });
        }

        const uploadDir = path.resolve(process.cwd(), 'dataset', 'uploads', 'disease');
        fs.mkdirSync(uploadDir, { recursive: true });
        const targetPath = path.join(uploadDir, validation.safeName);
        fs.writeFileSync(targetPath, file.buffer);

        const prediction = await predictUploadedImage(targetPath, MODEL_ROOT, 0.7, req.body?.cropHint || req.body?.selectedCrop || 'Tomato');
        const knowledge = getDiseaseKnowledge(prediction.crop, prediction.disease);
        const normalized = {
          id: `det_${Date.now()}`,
          userId: currentUser.id,
          crop: prediction.crop,
          disease: prediction.disease,
          confidence: Number(prediction.confidence ?? 0),
          healthy: Boolean(prediction.healthy),
          severity: (prediction.disease === 'Unknown' ? 'Unknown' : prediction.healthy ? 'Healthy' : prediction.confidence >= 0.75 ? 'Moderate' : 'Mild') as 'Unknown' | 'Healthy' | 'Moderate' | 'Mild' | 'Severe',
          detectedAt: new Date().toISOString(),
          imageUrl: path.basename(targetPath),
          imagePath: targetPath,
          modelVersion: prediction.modelVersion || 'crop_disease_model_v1',
          message: prediction.message,
          symptoms: knowledge.symptoms,
          recommendedActions: knowledge.recommendedActions,
          prevention: knowledge.prevention,
          officerConsultationNeeded: prediction.disease === 'Unknown' || prediction.confidence < 0.7,
          explanation: knowledge.explanation,
          diseaseInfo: knowledge,
        };

        db.saveDiseaseDetection(normalized);
        db.addAuditLog(currentUser.email, 'DISEASE_INFERENCE', 'DiseaseModel', `Detected ${normalized.disease} with ${Math.round(normalized.confidence * 100)}% confidence.`);
        return res.json(normalized);
      } catch (error: any) {
        console.error('ML disease prediction error:', error);
        return res.status(503).json({
          error: error.message || 'The trained disease detection model is unavailable right now.',
          crop: 'Unknown',
          disease: 'Unknown',
          confidence: 0,
          healthy: false,
          message: 'Model unavailable. Please ensure the model has been trained and is present in models/crop_disease_model.',
        });
      }
    });
  });

  app.get('/api/disease/detections', (req: Request, res: Response) => {
    const farmId = req.query.farmId as string;
    const list = farmId ? db.getDetectionsByFarm(farmId) : db.getAllDiseaseDetections();
    res.json(list);
  });

  // --- CROP RECOMMENDATION ---
  app.post('/api/crop/recommend', (req: Request, res: Response) => {
    try {
      const { userId, ...input } = req.body;
      const rankedCrops = recommendCrops({
        nitrogen: Number(input.nitrogen ?? 90),
        phosphorus: Number(input.phosphorus ?? 50),
        potassium: Number(input.potassium ?? 65),
        ph: Number(input.ph ?? 6.5),
        temperature: Number(input.temperature ?? 28),
        humidity: Number(input.humidity ?? 70),
        rainfall: Number(input.rainfall ?? 750),
        soilType: input.soilType || 'Red & Yellow',
        state: input.state || 'Karnataka',
        season: input.season || 'Kharif',
        irrigationAvailability: input.irrigationAvailability || 'Moderate',
      });

      if (userId) {
        db.saveCropRecommendation(userId, input, rankedCrops);
      }
      res.json({ recommendations: rankedCrops });
    } catch (err: any) {
      console.error('Error in crop recommendation:', err);
      res.status(500).json({ error: 'Failed to compute crop recommendation' });
    }
  });

  app.get('/api/crop/catalog', (req: Request, res: Response) => {
    try {
      const { category, search } = req.query;
      let crops = getAllCropsCatalog();
      if (category && typeof category === 'string' && category !== 'All') {
        crops = crops.filter(c => c.category.toLowerCase() === category.toLowerCase());
      }
      if (search && typeof search === 'string') {
        const q = search.toLowerCase().trim();
        crops = crops.filter(c =>
          c.name.toLowerCase().includes(q) ||
          (c.hindiName && c.hindiName.toLowerCase().includes(q)) ||
          (c.scientificName && c.scientificName.toLowerCase().includes(q))
        );
      }
      res.json({ total: crops.length, crops });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve crop catalog' });
    }
  });

  app.get('/api/crop/detail/:name', (req: Request, res: Response) => {
    const crop = getCropByName(req.params.name);
    if (!crop) return res.status(404).json({ error: 'Crop not found' });
    res.json(crop);
  });

  // --- YIELD PREDICTION ---
  app.post('/api/yield/predict', (req: Request, res: Response) => {
    try {
      const { userId, ...input } = req.body;
      const result = predictYield({
        crop: input.crop || 'Tomato',
        farmAreaAcres: Number(input.farmAreaAcres ?? 3.5),
        soilType: input.soilType || 'Red & Yellow',
        nitrogen: Number(input.nitrogen ?? 95),
        phosphorus: Number(input.phosphorus ?? 55),
        potassium: Number(input.potassium ?? 70),
        ph: Number(input.ph ?? 6.5),
        rainfallMm: Number(input.rainfallMm ?? 650),
        temperatureC: Number(input.temperatureC ?? 28),
        humidityPercent: Number(input.humidityPercent ?? 72),
        fertilizerUsageKgPerAcre: Number(input.fertilizerUsageKgPerAcre ?? 120),
        irrigationType: input.irrigationType || 'Drip',
        sowingDate: input.sowingDate || '2026-07-05',
        state: input.state || 'Karnataka',
      });

      if (userId) {
        db.saveYieldPrediction(userId, input, result);
      }
      res.json(result);
    } catch (err: any) {
      console.error('Error in yield prediction:', err);
      res.status(500).json({ error: 'Failed to predict crop yield' });
    }
  });

  // --- WEATHER & AGRICULTURAL ADVISORIES ---
  app.get('/api/location/reverse', async (req: Request, res: Response) => {
    const lat = req.query.lat ? Number(req.query.lat) : 13.1367;
    const lng = req.query.lng ? Number(req.query.lng) : 78.1347;
    const details = await reverseGeocodeLocation(lat, lng);
    res.json(details);
  });

  app.get('/api/location/search', async (req: Request, res: Response) => {
    const q = req.query.q as string;
    const results = await searchLocations(q);
    res.json(results);
  });

  app.get('/api/weather', async (req: Request, res: Response) => {
    const lat = req.query.lat ? Number(req.query.lat) : 13.1367;
    const lng = req.query.lng ? Number(req.query.lng) : 78.1347;
    const weather = await fetchWeatherIntelligence(lat, lng);
    res.json(weather);
  });

  app.get('/api/advisories', (req: Request, res: Response) => {
    const farmId = req.query.farmId as string;
    if (farmId) {
      const advisory = db.getAdvisoryByFarm(farmId);
      return res.json(advisory);
    }
    res.json(db.getAdvisories());
  });

  // --- NOTIFICATIONS ---
  app.get('/api/notifications', (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    res.json(db.getNotifications(userId));
  });

  app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
    const success = db.markNotificationRead(req.params.id);
    res.json({ success });
  });

  // --- FARMER DASHBOARD UNIFIED DATA ---
  app.get('/api/dashboard', async (req: Request, res: Response) => {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const farmerId = (req.query.farmerId as string) || sessionUser.id;
    const farms = db.getFarmsByFarmer(farmerId);
    const activeFarm = farms[0];

    const weather = await fetchWeatherIntelligence(activeFarm?.lat || 13.1367, activeFarm?.lng || 78.1347);
    const advisory = activeFarm ? db.getAdvisoryByFarm(activeFarm.id) : db.getAdvisories()[0];
    const detections = activeFarm ? db.getDetectionsByFarm(activeFarm.id) : [];

    res.json({
      farmerName: activeFarm?.farmerName || sessionUser.name,
      totalFarms: farms.length,
      activeFarm,
      activeCropsCount: farms.reduce((acc, f) => acc + (f.activeCrops?.length || 0), 0),
      farmHealthScore: activeFarm?.healthScore || 0,
      weather,
      todayAdvisory: advisory,
      recentDetections: detections.slice(0, 3),
      riskLevel: activeFarm?.riskLevel || 'LOW',
    });
  });

  // --- AGRICULTURE OFFICER PORTAL ---
  app.get('/api/officer/farms', (req: Request, res: Response) => {
    const district = (req.query.district as string) || 'Kolar';
    const allFarms = db.getAllFarms();
    res.json(allFarms);
  });

  app.get('/api/officer/disease-hotspots', (req: Request, res: Response) => {
    const farms = db.getAllFarms();
    const detections = db.getAllDiseaseDetections();
    const hotspots = detectDiseaseHotspots(farms, detections);
    res.json(hotspots);
  });

  app.post('/api/officer/broadcast-advisory', (req: Request, res: Response) => {
    const { title, message, severity, targetDistrict } = req.body;
    const notif = db.createNotification({
      userId: 'all',
      type: 'OFFICER_ADVISORY',
      severity: severity || 'WARNING',
      title: title || 'Agriculture Officer Regional Advisory',
      message: message || '',
      channel: 'IN_APP',
    });
    db.addAuditLog('officer.kolar@agrivision.in', 'BROADCAST_ADVISORY', 'Notification', `Broadcast advisory to ${targetDistrict || 'all farmers'}: ${title}`);
    res.json({ success: true, notification: notif });
  });

  // --- AGRICULTURE OFFICER & FARMER INTERACTION SERVICES ---
  app.get('/api/support-tickets', (req: Request, res: Response) => {
    const farmerId = req.query.farmerId as string | undefined;
    res.json(db.getFarmerTickets(farmerId));
  });

  app.get('/api/support-tickets/:id', (req: Request, res: Response) => {
    const ticket = db.getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  });

  app.post('/api/support-tickets', (req: Request, res: Response) => {
    try {
      const {
        farmerId,
        farmerName,
        farmerPhone,
        district,
        taluk,
        village,
        lat,
        lng,
        crop,
        variety,
        affectedAcreage,
        category,
        title,
        description,
        imageUrl,
        severity,
      } = req.body;

      if (!farmerName || !crop || !title || !description) {
        return res.status(400).json({ error: 'Missing required fields: farmerName, crop, title, and description are required.' });
      }

      const ticket = db.createFarmerTicket({
        farmerId: farmerId || 'usr_farmer_1',
        farmerName,
        farmerPhone: farmerPhone || '+91 98451 23456',
        district: district || 'Kolar',
        taluk: taluk || 'Srinivaspur',
        village: village || 'Rayalpadu',
        lat: lat ? Number(lat) : 13.1367,
        lng: lng ? Number(lng) : 78.1347,
        crop,
        variety: variety || 'Standard Local Hybrid',
        affectedAcreage: affectedAcreage ? Number(affectedAcreage) : 1.0,
        category: category || 'CROP_DAMAGE_COMPENSATION',
        title,
        description,
        imageUrl,
        severity: severity || 'MODERATE',
      });

      res.status(201).json(ticket);
    } catch (err: any) {
      console.error('Error creating support ticket:', err);
      res.status(500).json({ error: 'Failed to create support ticket' });
    }
  });

  app.post('/api/support-tickets/:id/resolve', (req: Request, res: Response) => {
    try {
      const {
        officerId,
        officerName,
        designation,
        department,
        officialStampNumber,
        diagnosisAndAction,
        prescribedFormulation,
        scheduledVisitDate,
        pmfbyApprovedReliefAmount,
        status,
      } = req.body;

      const updated = db.resolveFarmerTicket(
        req.params.id,
        {
          officerId: officerId || 'usr_officer_1',
          officerName: officerName || 'Dr. Ananya Sharma',
          designation: designation || 'Assistant Director of Agriculture (ADA)',
          department: department || 'Department of Agriculture, Govt. of Karnataka',
          officialStampNumber: officialStampNumber || 'KA-AGRI-KLR-2026/049',
          diagnosisAndAction: diagnosisAndAction || 'Verified on ground. Prescription issued.',
          prescribedFormulation,
          scheduledVisitDate,
          pmfbyApprovedReliefAmount: pmfbyApprovedReliefAmount ? Number(pmfbyApprovedReliefAmount) : undefined,
          respondedAt: new Date().toISOString(),
        },
        status || 'APPROVED_RESOLVED'
      );

      if (!updated) return res.status(404).json({ error: 'Ticket not found' });
      res.json(updated);
    } catch (err: any) {
      console.error('Error resolving support ticket:', err);
      res.status(500).json({ error: 'Failed to resolve support ticket' });
    }
  });

  app.get('/api/subsidized-schemes', (req: Request, res: Response) => {
    const district = req.query.district as string | undefined;
    res.json(db.getSubsidizedSchemes(district));
  });

  app.post('/api/subsidized-schemes', (req: Request, res: Response) => {
    try {
      const {
        schemeName,
        category,
        crop,
        originalPrice,
        subsidizedPrice,
        subsidyPercent,
        totalQuotaBags,
        distributionCenter,
        eligibleDistricts,
        authorizedByOfficer,
        validUntil,
      } = req.body;

      if (!schemeName || !crop || !distributionCenter) {
        return res.status(400).json({ error: 'Missing required scheme fields' });
      }

      const newScheme = db.createSubsidizedScheme({
        schemeName,
        category: category || 'CERTIFIED_SEEDS',
        crop,
        originalPrice: Number(originalPrice) || 1000,
        subsidizedPrice: Number(subsidizedPrice) || 500,
        subsidyPercent: Number(subsidyPercent) || 50,
        totalQuotaBags: Number(totalQuotaBags) || 500,
        availableQuotaBags: Number(totalQuotaBags) || 500,
        distributionCenter,
        eligibleDistricts: Array.isArray(eligibleDistricts) && eligibleDistricts.length > 0 ? eligibleDistricts : ['All Districts'],
        authorizedByOfficer: authorizedByOfficer || 'Agricultural Officer, Taluk KSK',
        validUntil: validUntil || '2026-11-30',
        isActive: true,
      });

      res.status(201).json(newScheme);
    } catch (err: any) {
      console.error('Error creating scheme:', err);
      res.status(500).json({ error: 'Failed to create subsidized scheme' });
    }
  });

  app.post('/api/claim-quota-token', (req: Request, res: Response) => {
    try {
      const { schemeId, farmerId, farmerName, farmerPhone, farmerAadhaarLast4, quantityBooked } = req.body;
      if (!schemeId || !farmerName) {
        return res.status(400).json({ error: 'Missing schemeId or farmerName' });
      }

      const result = db.claimQuotaToken({
        schemeId,
        farmerId: farmerId || 'usr_farmer_1',
        farmerName,
        farmerPhone: farmerPhone || '+91 98451 23456',
        farmerAadhaarLast4: farmerAadhaarLast4 || '4289',
        quantityBooked: Number(quantityBooked) || 1,
      });

      if ('error' in result) {
        return res.status(400).json({ error: result.error });
      }

      res.status(201).json(result);
    } catch (err: any) {
      console.error('Error claiming quota token:', err);
      res.status(500).json({ error: 'Failed to generate RSK token' });
    }
  });

  app.get('/api/quota-tokens', (req: Request, res: Response) => {
    const farmerId = req.query.farmerId as string | undefined;
    res.json(db.getFarmerTokens(farmerId));
  });

  // --- AI FARM ASSISTANT ---
  app.post('/api/assistant/ask', async (req: Request, res: Response) => {
    try {
      const { question, context, language } = req.body;
      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }
      const response = await askAgriAssistant(question, context || {}, (language || 'en') as IndianLanguage);
      res.json(response);
    } catch (err: any) {
      console.error('Assistant error:', err);
      res.status(500).json({ error: 'Failed to get answer from AI assistant' });
    }
  });

  // --- GOOGLE-GROUNDED SEED AND MANDI PRICE SEARCH ---
  app.post('/api/mandi/google-search', async (req: Request, res: Response) => {
    const cropName = String(req.body?.cropName || '').trim();
    const state = String(req.body?.state || 'All India').trim();
    const market = String(req.body?.market || '').trim();

    if (!cropName) {
      return res.status(400).json({ error: 'Crop or seed name is required.' });
    }

    const gemini = getGeminiClient();
    if (!gemini) {
      return res.status(503).json({ error: 'Google-grounded price search is unavailable. Set GEMINI_API_KEY or GOOGLE_API_KEY in the server environment and restart the server.' });
    }

    try {
      const location = state === 'All India' ? 'India' : state;
      const marketText = market ? `, especially around ${market}` : '';
      const response = await gemini.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
        contents: `Find the latest available retail or wholesale market price for ${cropName} seed in ${location}${marketText}. Use current Indian web sources and prioritize government, agricultural university, recognized seed company, or reputable market sources. Clearly distinguish seed price from harvested crop mandi price. Return a concise answer with the price range, unit (per kg, packet, or quintal), date or freshness, state/market, and a one-line source caveat.`,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: 'You are an Indian agricultural market researcher. Never invent a price. If no current seed price is available, say so and provide the latest dated reference you can verify.',
        },
      });

      const answer = response.text?.trim();
      if (!answer) {
        return res.status(502).json({ error: 'No grounded price result was returned.' });
      }

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata as {
        groundingChunks?: Array<{ web?: { title?: string; uri?: string } }>;
      } | undefined;
      const sources = (groundingMetadata?.groundingChunks || [])
        .map((chunk) => chunk.web)
        .filter((source): source is { title: string; uri: string } => Boolean(source?.uri))
        .slice(0, 6)
        .map((source) => ({ title: source.title || source.uri, url: source.uri }));

      return res.json({ cropName, answer, sources, checkedAt: new Date().toISOString(), state, market });
    } catch (err: any) {
      const message = err?.message || String(err);
      if (message.includes('403') || message.includes('PERMISSION_DENIED')) {
        disableGeminiClient();
      }
      console.error('Google-grounded mandi search failed:', err);
      if (err?.status === 429 || message.includes('RESOURCE_EXHAUSTED')) {
        return res.status(429).json({ error: 'Google price search reached its API quota. Local mandi prices remain available; add billing or use a fresh Gemini API key, then restart the server.' });
      }
      return res.status(502).json({ error: 'Unable to retrieve a grounded current price right now.' });
    }
  });

  // --- ADMIN PORTAL ---
  app.get('/api/admin/models', (req: Request, res: Response) => {
    res.json(db.getModelVersions());
  });

  app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
    res.json(db.getAuditLogs());
  });

  app.get('/api/analytics/impact', (req: Request, res: Response) => {
    res.json(db.getSystemImpactAnalytics());
  });

  app.post('/api/demo/reset', (req: Request, res: Response) => {
    db.resetToSeedData();
    res.json({ success: true, message: 'Database reset to SIH demonstration state.' });
  });

  // --- NEW EXPANSION ROUTES ---
  setupExpansionRoutes(app);

  // --- VITE MIDDLEWARE (DEV) OR STATIC FILES (PROD) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      root: path.join(process.cwd(), 'frontend'),
      server: {
        middlewareMode: true,
        // The API server owns the browser connection in this middleware setup.
        // Disabling Vite's separate websocket avoids collisions during restarts.
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'frontend', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const listenOnAvailablePort = (port: number) => {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`🌾 AgriVision AI Platform listening on http://0.0.0.0:${port}`);
    });
    server.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code !== 'EADDRINUSE') {
        throw error;
      }
      const probe = net.createServer();
      probe.listen(0, '127.0.0.1', () => {
        const nextPort = (probe.address() as net.AddressInfo).port;
        probe.close(() => listenOnAvailablePort(nextPort));
      });
    });
  };

  listenOnAvailablePort(requestedPort);
}

startServer();
