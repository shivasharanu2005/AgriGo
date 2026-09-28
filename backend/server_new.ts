import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import { prisma } from './prisma/client.ts';
import multer from 'multer';
import { detectCropDisease } from '../ai/diseaseDetector.ts';
import { recommendCrops } from '../ai/cropRecommender.ts';
import { predictYield } from '../ai/yieldPredictor.ts';

dotenv.config();

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// -- MIDDLEWARES --
export const requireAuth = (req: Request, res: Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.agrivision_session;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// -- AUTH ENDPOINTS --
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role, language, state, district, taluk, village } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password required.' });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists.' });

    const passwordHash = await bcrypt.hash(password, 10);
    
    const userRole = role || 'FARMER';
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: userRole,
        language: language || 'en',
        farmerProfile: userRole === 'FARMER' ? {
          create: {
            state: state || '',
            district: district || '',
            taluk: taluk || '',
            village: village || '',
            preferredLanguage: language || 'en'
          }
        } : undefined
      },
      include: { farmerProfile: true }
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    
    res.status(201).json({ message: 'Account created', user: safeUser, token });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    
    res.json({ message: 'Logged in successfully', user: safeUser, token });
  } catch (err: any) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

app.get('/api/auth/me', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { farmerProfile: true } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

// -- FARM MANAGEMENT --
app.get('/api/farms', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const role = (req as any).user.role;
  
  let farms;
  if (role === 'ADMIN') {
    farms = await prisma.farm.findMany({ include: { crops: true } });
  } else {
    farms = await prisma.farm.findMany({ where: { farmerId: userId }, include: { crops: true } });
  }
  res.json(farms);
});

app.post('/api/farms', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const farmData = req.body;
  
  const newFarm = await prisma.farm.create({
    data: {
      ...farmData,
      farmerId: userId
    }
  });
  res.status(201).json(newFarm);
});

// -- CROPS --
app.post('/api/farms/:farmId/crops', requireAuth, async (req: Request, res: Response) => {
  const { farmId } = req.params;
  const cropData = req.body;
  
  const crop = await prisma.crop.create({
    data: {
      ...cropData,
      farmId
    }
  });
  res.status(201).json(crop);
});

// -- INSURANCE --
app.get('/api/insurance/applications', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const role = (req as any).user.role;
  
  const applications = role === 'ADMIN'
    ? await prisma.insurancePolicy.findMany()
    : await prisma.insurancePolicy.findMany({ where: { farmerId: userId } });
    
  res.json(applications);
});

app.post('/api/insurance/applications', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const applicationData = req.body;
  
  const application = await prisma.insurancePolicy.create({
    data: {
      ...applicationData,
      farmerId: userId
    }
  });
  res.status(201).json(application);
});

// -- AI & DISEASE DETECTION --
app.post('/api/disease/detect', requireAuth, async (req: Request, res: Response) => {
  try {
    const { image, cropHint, farmId } = req.body;
    if (!image) return res.status(400).json({ error: 'Image data is required' });

    const result = await detectCropDisease(image, cropHint);
    
    // Save to database
    const saved = await prisma.diseaseDetection.create({
      data: {
        userId: (req as any).user.userId,
        crop: result.crop,
        disease: result.disease,
        confidence: result.confidence,
        severity: result.severity,
        message: result.explanation,
        symptoms: JSON.stringify(result.symptoms || []),
        recommendedActions: JSON.stringify(result.recommendedActions || []),
      }
    });

    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'An error occurred during neural inference.' });
  }
});

app.post('/api/crop/recommend', requireAuth, async (req: Request, res: Response) => {
  try {
    const recommendations = await recommendCrops(req.body);
    res.json({ recommendations });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to recommend crops.' });
  }
});

app.post('/api/yield/predict', requireAuth, async (req: Request, res: Response) => {
  try {
    const prediction = await predictYield(req.body);
    res.json(prediction);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to predict yield.' });
  }
});

// Start Server Wrapper
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app };
