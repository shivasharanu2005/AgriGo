import { Express, Request, Response } from 'express';
import { db } from './db.ts';
import { getGeminiClient, disableGeminiClient } from './gemini.ts';
import { getSessionUser } from './session.ts';

export function setupExpansionRoutes(app: Express) {
  // --- FIELDS & IRRIGATION ---
  app.get('/api/farms/:farmId/fields', (req: Request, res: Response) => {
    // In this simulation, farms have activeCrops representing fields/plots.
    const farm = db.getFarmById(req.params.farmId);
    if (!farm) return res.status(404).json({ error: 'Farm not found' });
    res.json(farm.activeCrops);
  });

  app.get('/api/fields/:fieldId/irrigation', (req: Request, res: Response) => {
    const records = db.data.irrigationRecords.filter(r => r.fieldId === req.params.fieldId);
    res.json(records);
  });

  app.post('/api/fields/:fieldId/irrigation', (req: Request, res: Response) => {
    const record = {
      id: `irr_${Date.now()}`,
      fieldId: req.params.fieldId,
      farmId: req.body.farmId || '',
      date: req.body.date || new Date().toISOString(),
      waterQuantityLiters: Number(req.body.waterQuantityLiters) || 0,
      method: req.body.method || 'Drip',
      durationMinutes: Number(req.body.durationMinutes) || 0,
    };
    db.data.irrigationRecords.push(record);
    db.saveData();
    res.status(201).json(record);
  });

  // --- CROP CALENDAR ---
  app.get('/api/farms/:farmId/calendar', (req: Request, res: Response) => {
    const tasks = db.data.cropCalendarTasks.filter(t => t.farmId === req.params.farmId);
    res.json(tasks);
  });

  app.post('/api/farms/:farmId/calendar', (req: Request, res: Response) => {
    const task = {
      ...req.body,
      id: `cal_${Date.now()}`,
      farmId: req.params.farmId,
      status: req.body.status || 'PENDING'
    };
    db.data.cropCalendarTasks.push(task);
    db.saveData();
    res.status(201).json(task);
  });

  app.put('/api/calendar/:taskId/status', (req: Request, res: Response) => {
    const task = db.data.cropCalendarTasks.find(t => t.id === req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.status = req.body.status;
    db.saveData();
    res.json(task);
  });

  // --- FARM DIARY ---
  app.get('/api/farms/:farmId/diary', (req: Request, res: Response) => {
    const entries = db.data.farmDiaryEntries.filter(e => e.farmId === req.params.farmId);
    res.json(entries);
  });

  app.post('/api/farms/:farmId/diary', (req: Request, res: Response) => {
    const entry = {
      ...req.body,
      id: `diary_${Date.now()}`,
      farmId: req.params.farmId,
      date: req.body.date || new Date().toISOString(),
      images: req.body.images || []
    };
    db.data.farmDiaryEntries.push(entry);
    db.saveData();
    res.status(201).json(entry);
  });

  // --- EXPENSES & FINANCE ---
  app.get('/api/farms/:farmId/expenses', (req: Request, res: Response) => {
    const expenses = db.data.expenses.filter(e => e.farmId === req.params.farmId);
    res.json(expenses);
  });

  app.post('/api/farms/:farmId/expenses', (req: Request, res: Response) => {
    const expense = {
      ...req.body,
      id: `exp_${Date.now()}`,
      farmId: req.params.farmId,
      date: req.body.date || new Date().toISOString(),
      amount: Number(req.body.amount) || 0
    };
    db.data.expenses.push(expense);
    db.saveData();
    res.status(201).json(expense);
  });

  // --- MARKETS ---
  app.get('/api/markets', (req: Request, res: Response) => {
    res.json(db.data.markets);
  });

  app.get('/api/markets/prices', (req: Request, res: Response) => {
    const cropName = req.query.cropName as string;
    let prices = db.data.marketPrices;
    if (cropName) {
      prices = prices.filter(p => p.cropName.toLowerCase() === cropName.toLowerCase());
    }
    res.json(prices);
  });

  // --- CURRENT SEED PRICE INTELLIGENCE ---
  app.post('/api/mandi/seed-prices', async (req: Request, res: Response) => {
    const state = String(req.body?.state || 'All India');
    const seeds = Array.isArray(req.body?.seeds)
      ? req.body.seeds.map((seed: unknown) => String(seed).trim()).filter(Boolean).slice(0, 30)
      : [];

    if (seeds.length === 0) {
      return res.status(400).json({ error: 'At least one seed name is required.' });
    }

    const gemini = getGeminiClient();
    if (!gemini) {
      return res.status(503).json({ error: 'Live seed price search is unavailable. Set GEMINI_API_KEY or GOOGLE_API_KEY in the server environment and restart the server.' });
    }

    const prompt = `Find the latest publicly available seed prices in India for these seeds: ${seeds.join(', ')}.
Location preference: ${state}. Search current Indian agriculture news, government market information, seed company listings, and reputable agricultural marketplaces.
Important: seed prices are often retail or dealer prices rather than mandi wholesale prices. Never invent a price. For each seed, return the best current price range you can verify, its unit (kg, packet, or another unit), market/state, source title and URL, and the date checked.
Return ONLY valid JSON in this shape:
{"prices":[{"seedName":"...","price":"₹...","unit":"...","market":"...","source":"...","sourceUrl":"...","checkedAt":"...","confidence":"high|medium|low","note":"..."}]}
Include one item for every requested seed. If no reliable current price is found, set price to "Unavailable" and explain why in note. Do not use markdown.`;

    try {
      const response = await gemini.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim();
      if (!text) {
        return res.status(502).json({ error: 'No current seed price data was returned.' });
      }

      const parsed = JSON.parse(text) as { prices?: unknown[] };
      const prices = Array.isArray(parsed.prices) ? parsed.prices : [];
      return res.json({ state, prices, checkedAt: new Date().toISOString() });
    } catch (error: any) {
      const message = error?.message || String(error);
      if (message.includes('403') || message.includes('PERMISSION_DENIED') || message.includes('denied access')) {
        disableGeminiClient();
      }
      console.error('Seed price search failed:', error);
      if (error?.status === 429 || message.includes('RESOURCE_EXHAUSTED')) {
        return res.status(429).json({ error: 'Google price search reached its API quota. Add billing or use a fresh Gemini API key, then restart the server.' });
      }
      return res.status(502).json({ error: 'Unable to retrieve current seed prices from Google-grounded sources.' });
    }
  });

  // --- AGRI MARKETPLACE ---
  const normalizeRole = (role?: string) => String(role || '').trim().toUpperCase();
  const isAuthorizedManager = (user: any) => user && (user.role === 'ADMIN' || user.role === 'OFFICER');

  app.get('/api/marketplace/products', (req: Request, res: Response) => {
    const category = req.query.category as string;
    let products = db.data.marketplaceProducts;
    if (category) {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    res.json(products);
  });

  app.post('/api/marketplace/products', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    if (user.role !== 'ADMIN' && user.role !== 'OFFICER') {
      return res.status(403).json({ error: 'Only admins and officers can create marketplace products.' });
    }

    const name = String(req.body?.name || '').trim();
    const category = String(req.body?.category || '').trim();
    const description = String(req.body?.description || '').trim();
    const price = Number(req.body?.price);
    const stock = Number(req.body?.stock ?? 0);

    if (!name || !category || !description) {
      return res.status(400).json({ error: 'Name, category, and description are required.' });
    }
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ error: 'Price must be greater than zero.' });
    }
    if (!Number.isFinite(stock) || stock < 0) {
      return res.status(400).json({ error: 'Stock must be zero or greater.' });
    }

    const product = {
      id: `prod_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      sellerId: user.id,
      createdBy: user.name,
      createdById: user.id,
      ownerId: user.id,
      ownerRole: user.role,
      name,
      category,
      price,
      stock,
      images: Array.isArray(req.body?.images) ? req.body.images.filter(Boolean) : [],
      description,
      unit: req.body?.unit || 'unit',
      brand: req.body?.brand || 'AgriVision',
      seller: user.name,
      sellerVerified: true,
      rating: Number(req.body?.rating ?? 4.5),
      reviewCount: Number(req.body?.reviewCount ?? 0),
      location: req.body?.location || 'Karnataka',
      tags: Array.isArray(req.body?.tags) ? req.body.tags : [],
      featured: Boolean(req.body?.featured),
      organic: Boolean(req.body?.organic),
      deliveryDays: req.body?.deliveryDays || '2-5 days',
      originalPrice: Number(req.body?.originalPrice ?? price),
      discount: Number(req.body?.discount ?? 0),
    };

    db.data.marketplaceProducts.unshift(product);
    db.saveData();
    res.status(201).json(product);
  });

  app.put('/api/marketplace/products/:id', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    if (user.role !== 'ADMIN' && user.role !== 'OFFICER') {
      return res.status(403).json({ error: 'Only admins and officers can edit marketplace products.' });
    }

    const product = db.data.marketplaceProducts.find(item => item.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    if (user.role !== 'ADMIN' && product.ownerId && product.ownerId !== user.id) {
      return res.status(403).json({ error: 'You can only edit products you created.' });
    }

    const nextName = String(req.body?.name ?? product.name).trim();
    const nextCategory = String(req.body?.category ?? product.category).trim();
    const nextDescription = String(req.body?.description ?? product.description).trim();
    const nextPrice = Number(req.body?.price ?? product.price);
    const nextStock = Number(req.body?.stock ?? product.stock);

    if (!nextName || !nextCategory || !nextDescription) {
      return res.status(400).json({ error: 'Name, category, and description are required.' });
    }
    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      return res.status(400).json({ error: 'Price must be greater than zero.' });
    }
    if (!Number.isFinite(nextStock) || nextStock < 0) {
      return res.status(400).json({ error: 'Stock must be zero or greater.' });
    }

    Object.assign(product, {
      ...product,
      ...req.body,
      name: nextName,
      category: nextCategory,
      description: nextDescription,
      price: nextPrice,
      stock: nextStock,
      sellerId: product.sellerId || user.id,
      createdBy: product.createdBy || user.name,
      createdById: product.createdById || user.id,
      ownerId: product.ownerId || user.id,
      ownerRole: product.ownerRole || user.role,
      seller: product.seller || user.name,
      sellerVerified: product.sellerVerified ?? true,
    });

    db.saveData();
    res.json(product);
  });

  app.delete('/api/marketplace/products/:id', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    if (user.role !== 'ADMIN' && user.role !== 'OFFICER') {
      return res.status(403).json({ error: 'Only admins and officers can delete marketplace products.' });
    }

    const index = db.data.marketplaceProducts.findIndex(item => item.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Product not found.' });
    const product = db.data.marketplaceProducts[index];
    if (user.role !== 'ADMIN' && product.ownerId && product.ownerId !== user.id) {
      return res.status(403).json({ error: 'You can only delete your own listings.' });
    }

    db.data.marketplaceProducts.splice(index, 1);
    db.saveData();
    res.json({ success: true, message: 'Product deleted successfully.' });
  });

  // --- EXPERT CONSULTATION ---
  app.get('/api/consultations', (req: Request, res: Response) => {
    const farmerId = req.query.farmerId as string;
    let list = db.data.expertConsultations;
    if (farmerId) list = list.filter(c => c.farmerId === farmerId);
    res.json(list);
  });

  app.post('/api/consultations', (req: Request, res: Response) => {
    const consultation = {
      ...req.body,
      id: `cons_${Date.now()}`,
      status: 'PENDING',
      images: req.body.images || [],
      createdAt: new Date().toISOString()
    };
    db.data.expertConsultations.push(consultation);
    db.saveData();
    res.status(201).json(consultation);
  });

  // --- COMMUNITY ---
  app.get('/api/community/posts', (req: Request, res: Response) => {
    res.json(db.data.communityPosts);
  });

  app.post('/api/community/posts', (req: Request, res: Response) => {
    const post = {
      ...req.body,
      id: `post_${Date.now()}`,
      images: req.body.images || [],
      likes: 0,
      createdAt: new Date().toISOString()
    };
    db.data.communityPosts.unshift(post);
    db.saveData();
    res.status(201).json(post);
  });

  app.post('/api/community/posts/:id/like', (req: Request, res: Response) => {
    const post = db.data.communityPosts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.likes += 1;
    db.saveData();
    res.json(post);
  });
  // --- EQUIPMENT RENTAL ---
  app.get('/api/equipment', (req: Request, res: Response) => {
    res.json(db.data.equipment);
  });

  app.post('/api/equipment', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    if (user.role !== 'ADMIN' && user.role !== 'OFFICER') {
      return res.status(403).json({ error: 'Only admins and officers can create equipment listings.' });
    }

    const name = String(req.body?.name || '').trim();
    const category = String(req.body?.category || '').trim();
    const pricePerDay = Number(req.body?.pricePerDay);
    const hourlyRate = Number(req.body?.hourlyRate ?? 0);
    const lat = Number(req.body?.lat ?? 13.1367);
    const lng = Number(req.body?.lng ?? 78.1347);
    const securityDeposit = Number(req.body?.securityDeposit ?? Math.max(0, pricePerDay * 2 || 0));
    const minimumDays = Number(req.body?.minimumDays ?? 1);

    if (!name || !category) {
      return res.status(400).json({ error: 'Equipment name and category are required.' });
    }
    if (!Number.isFinite(pricePerDay) || pricePerDay < 0) {
      return res.status(400).json({ error: 'Daily price must be zero or greater.' });
    }
    if (!Number.isFinite(minimumDays) || minimumDays < 1) {
      return res.status(400).json({ error: 'Minimum rental days must be at least 1.' });
    }

    const equipment = {
      id: `eq_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      providerId: user.id,
      createdBy: user.name,
      createdById: user.id,
      ownerId: user.id,
      ownerRole: user.role,
      name,
      category,
      pricePerDay,
      hourlyRate: Number.isFinite(hourlyRate) ? hourlyRate : pricePerDay / 5,
      lat,
      lng,
      available: Boolean(req.body?.available ?? true),
      description: req.body?.description || 'Agricultural equipment available for rent.',
      image: req.body?.image || '',
      locationName: req.body?.locationName || 'Nearby farm',
      ownerName: user.name,
      distance: Number(req.body?.distance ?? 10),
      rating: Number(req.body?.rating ?? 4.5),
      reviews: Number(req.body?.reviews ?? 0),
      fuelType: req.body?.fuelType || 'Diesel',
      power: req.body?.power || 'Standard',
      modelYear: Number(req.body?.modelYear ?? new Date().getFullYear()),
      securityDeposit,
      deliveryAvailable: Boolean(req.body?.deliveryAvailable ?? true),
      verifiedOwner: true,
      minimumDays,
      specifications: Array.isArray(req.body?.specifications) ? req.body.specifications : ['Well maintained'],
    };

    db.data.equipment.unshift(equipment);
    db.saveData();
    res.status(201).json(equipment);
  });

  app.put('/api/equipment/:id', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    if (user.role !== 'ADMIN' && user.role !== 'OFFICER') {
      return res.status(403).json({ error: 'Only admins and officers can edit equipment listings.' });
    }

    const equipment = db.data.equipment.find(item => item.id === req.params.id);
    if (!equipment) return res.status(404).json({ error: 'Equipment not found.' });
    if (user.role !== 'ADMIN' && equipment.ownerId && equipment.ownerId !== user.id) {
      return res.status(403).json({ error: 'You can only edit equipment you created.' });
    }

    const nextName = String(req.body?.name ?? equipment.name).trim();
    const nextCategory = String(req.body?.category ?? equipment.category).trim();
    const nextPricePerDay = Number(req.body?.pricePerDay ?? equipment.pricePerDay);
    const nextMinimumDays = Number(req.body?.minimumDays ?? equipment.minimumDays ?? 1);

    if (!nextName || !nextCategory) {
      return res.status(400).json({ error: 'Equipment name and category are required.' });
    }
    if (!Number.isFinite(nextPricePerDay) || nextPricePerDay < 0) {
      return res.status(400).json({ error: 'Price per day must be zero or greater.' });
    }
    if (!Number.isFinite(nextMinimumDays) || nextMinimumDays < 1) {
      return res.status(400).json({ error: 'Minimum rental days must be at least 1.' });
    }

    Object.assign(equipment, {
      ...equipment,
      ...req.body,
      providerId: equipment.providerId || user.id,
      createdBy: equipment.createdBy || user.name,
      createdById: equipment.createdById || user.id,
      ownerId: equipment.ownerId || user.id,
      ownerRole: equipment.ownerRole || user.role,
      name: nextName,
      category: nextCategory,
      pricePerDay: nextPricePerDay,
      minimumDays: nextMinimumDays,
      available: Boolean(req.body?.available ?? equipment.available),
      ownerName: equipment.ownerName || user.name,
      verifiedOwner: true,
    });

    db.saveData();
    res.json(equipment);
  });

  app.delete('/api/equipment/:id', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    if (user.role !== 'ADMIN' && user.role !== 'OFFICER') {
      return res.status(403).json({ error: 'Only admins and officers can delete equipment listings.' });
    }

    const index = db.data.equipment.findIndex(item => item.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Equipment not found.' });
    const equipment = db.data.equipment[index];
    if (user.role !== 'ADMIN' && equipment.ownerId && equipment.ownerId !== user.id) {
      return res.status(403).json({ error: 'You can only delete equipment you created.' });
    }

    db.data.equipment.splice(index, 1);
    db.saveData();
    res.json({ success: true, message: 'Equipment deleted successfully.' });
  });

  app.get('/api/equipment/requests', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });

    const farmerId = req.query.farmerId as string;
    let requests = db.data.rentalRequests;
    if (user.role === 'FARMER') {
      requests = requests.filter(r => r.farmerId === user.id);
    } else if (user.role === 'OFFICER') {
      requests = requests.filter(r => r.ownerId === user.id || !r.ownerId);
    }
    if (farmerId && user.role === 'ADMIN') {
      requests = requests.filter(r => r.farmerId === farmerId);
    }
    if (farmerId && user.role === 'FARMER') {
      requests = requests.filter(r => r.farmerId === user.id && r.farmerId === farmerId);
    }
    res.json(requests);
  });

  app.post('/api/equipment/:id/book', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    if (user.role !== 'FARMER') {
      return res.status(403).json({ error: 'Only farmers can book equipment.' });
    }

    const equipment = db.data.equipment.find(item => item.id === req.params.id);
    if (!equipment) return res.status(404).json({ error: 'Equipment not found.' });

    const startDate = String(req.body?.startDate || '').trim();
    const endDate = String(req.body?.endDate || '').trim();
    const durationDays = Number(req.body?.durationDays ?? req.body?.days ?? 1);
    const totalAmount = Number(req.body?.totalAmount ?? 0);

    if (!startDate || !endDate) return res.status(400).json({ error: 'Rental start and end dates are required.' });
    if (!Number.isFinite(durationDays) || durationDays <= 0) return res.status(400).json({ error: 'Duration must be greater than zero.' });

    const start = new Date(startDate); const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return res.status(400).json({ error: 'Rental dates are invalid.' });
    }

    const requestDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const requestedTotal = Number(req.body?.totalAmount ?? equipment.pricePerDay * requestDays);
    const overlaps = db.data.rentalRequests.some((request) => {
      if (request.equipmentId !== equipment.id) return false;
      if (request.status === 'CANCELLED' || request.status === 'Rejected' || request.status === 'Cancelled') return false;
      const existingStart = new Date(request.startDate);
      const existingEnd = new Date(request.endDate);
      return start <= existingEnd && end >= existingStart;
    });

    if (overlaps) {
      return res.status(409).json({ error: 'This equipment is already booked for the selected date.' });
    }

    const booking = {
      id: `rental_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      farmerId: user.id,
      farmerName: user.name,
      ownerId: equipment.ownerId || equipment.providerId || '',
      startDate,
      endDate,
      days: requestDays,
      totalAmount: requestedTotal,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    db.data.rentalRequests.unshift(booking as any);
    db.saveData();
    res.status(201).json({ booking, message: 'Booking request created successfully.' });
  });

  // ── SOIL REPORTS ──────────────────────────────────────────────────────────
  app.get('/api/farms/:farmId/soil-reports', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const farm = db.getFarmById(req.params.farmId);
    if (!farm) return res.status(404).json({ error: 'Farm not found.' });
    // Return soil data from the farm's soil field plus generated report structure
    const soil = farm.soil;
    const report = {
      id: `soil_${farm.id}`,
      fieldId: farm.id,
      fieldName: farm.name,
      phLevel: soil?.ph ?? 6.8,
      nitrogen: soil?.nitrogen ?? 120,
      phosphorus: soil?.phosphorus ?? 45,
      potassium: soil?.potassium ?? 180,
      organicMatter: soil?.organicCarbon ?? 2.1,
      moistureContent: 22,
      ec: 1.1,
      temperature: 19.5,
      salinity: 0.3,
      micronutrients: { zinc: 1.0, iron: 3.5, manganese: 1.8, copper: 0.6, boron: 0.4 },
      sampleDate: soil?.lastTestedDate ?? new Date().toISOString().split('T')[0],
      healthScore: farm.healthScore ?? 75,
      recommendations: soil?.ph < 6.0
        ? [{ id: 'r1', text: 'Apply agricultural lime to increase soil pH above 6.2.', severity: 'high' }]
        : [{ id: 'r1', text: 'Soil pH is optimal. Maintain current management practices.', severity: 'low' }],
    };
    res.json([report]);
  });

  app.post('/api/farms/:farmId/soil-reports', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const farm = db.getFarmById(req.params.farmId);
    if (!farm) return res.status(404).json({ error: 'Farm not found.' });
    // Update the farm's soil data with the report input
    if (farm.soil) {
      Object.assign(farm.soil, {
        ph: req.body.phLevel ?? farm.soil.ph,
        nitrogen: req.body.nitrogen ?? farm.soil.nitrogen,
        phosphorus: req.body.phosphorus ?? farm.soil.phosphorus,
        potassium: req.body.potassium ?? farm.soil.potassium,
        organicCarbon: req.body.organicMatter ?? farm.soil.organicCarbon,
        lastTestedDate: req.body.sampleDate ?? new Date().toISOString().split('T')[0],
      });
      db.saveData();
    }
    res.status(201).json({ success: true, message: 'Soil report saved successfully.' });
  });

  // ── IRRIGATION ZONES ──────────────────────────────────────────────────────
  app.get('/api/farms/:farmId/irrigation', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const records = db.data.irrigationRecords.filter(r => r.farmId === req.params.farmId);
    // Return as irrigation zone format expected by SmartIrrigationPlanner
    const zones = records.length > 0 ? records.slice(0, 5).map((r, i) => ({
      id: r.id || `zone-${i}`,
      name: `Zone ${String.fromCharCode(65 + i)} - ${r.method || 'Drip'}`,
      cropType: 'Crop',
      soilMoistureCurrent: 22 + (i * 4),
      targetMoisture: 35,
      flowRateLpm: Number(r.waterQuantityLiters ?? 4000) / Math.max(1, Number(r.durationMinutes ?? 60)),
      nextIrrigationTime: new Date(Date.now() + (i + 1) * 3600 * 1000).toISOString(),
      waterAmountLiters: Number(r.waterQuantityLiters ?? 4000),
      durationMinutes: Number(r.durationMinutes ?? 45),
      method: (r.method || 'DRIP').toUpperCase(),
      status: 'SCHEDULED',
      manualOverride: false,
      valveHealth: 90 - i * 5,
    })) : [];
    res.json(zones);
  });

  app.post('/api/irrigation/zones/:zoneId/control', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const { action } = req.body;
    // Log the control action as an irrigation record
    const record = {
      id: `irr_ctrl_${Date.now()}`,
      fieldId: req.params.zoneId,
      farmId: '',
      date: new Date().toISOString(),
      waterQuantityLiters: action === 'START' ? 4000 : 0,
      method: 'Drip',
      durationMinutes: action === 'STOP' ? 0 : 45,
      action,
    };
    db.data.irrigationRecords.push(record as any);
    db.saveData();
    res.json({ success: true, action, zoneId: req.params.zoneId, timestamp: new Date().toISOString() });
  });

  // ── WATER LOGS ────────────────────────────────────────────────────────────
  app.get('/api/water-logs', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const records = db.data.irrigationRecords
      .filter(r => !r.farmId || r.farmId === (req.query.farmId as string || r.farmId))
      .slice(0, 50)
      .map(r => ({
        id: r.id,
        date: r.date,
        litres: r.waterQuantityLiters,
        costPerKilolitre: 18,
        source: 'Borewell',
        fieldName: r.fieldId || 'Farm field',
        method: r.method || 'Drip',
      }));
    res.json(records);
  });

  app.post('/api/water-logs', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const record = {
      id: `irr_${Date.now()}`,
      fieldId: req.body.field || req.body.fieldName || '',
      farmId: req.body.farmId || '',
      date: req.body.date || new Date().toISOString(),
      waterQuantityLiters: Number(req.body.litres) || 0,
      method: req.body.method || 'Drip',
      durationMinutes: Number(req.body.durationMinutes) || 45,
      source: req.body.source || 'Borewell',
    };
    db.data.irrigationRecords.push(record as any);
    db.saveData();
    res.status(201).json(record);
  });

  // ── NEWS ──────────────────────────────────────────────────────────────────
  app.get('/api/news', (req: Request, res: Response) => {
    const category = req.query.category as string;
    let newsData: any[] = db.data.advisories.map((a: any, i: number) => ({
      id: a.id || `news-${i}`,
      title: a.cropName || a.farmName || 'Agriculture Advisory',
      source: 'AgriVision Advisory',
      publishedAt: a.date || new Date().toISOString(),
      category: 'policy',
      summary: a.weatherForecast?.current || 'Check the latest advisory for your region.',
      url: '#',
    }));
    if (category && category !== 'all') {
      newsData = newsData.filter((n: any) => n.category === category);
    }
    res.json(newsData);
  });

  // ── ALERTS / NOTIFICATIONS ────────────────────────────────────────────────
  app.get('/api/alerts', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const notifications = db.getNotifications(user.id).slice(0, 20).map(n => ({
      id: n.id,
      title: n.title,
      detail: n.message,
      severity: n.severity === 'CRITICAL' ? 'critical' : n.severity === 'WARNING' ? 'warning' : 'info',
      raisedAt: n.createdAt,
      channel: n.channel || 'IN_APP',
    }));
    res.json(notifications);
  });

  // ── LIVESTOCK ─────────────────────────────────────────────────────────────
  app.get('/api/livestock', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const farmId = req.query.farmId as string;
    // Use diary entries tagged with livestock as a proxy storage
    const entries = db.data.farmDiaryEntries
      .filter(e => e.category === 'OBSERVATION' && e.title?.toLowerCase().includes('livestock'))
      .filter(e => !farmId || e.farmId === farmId)
      .map(e => ({
        id: e.id,
        tag: (e as any).animalTag || e.title || 'Animal',
        species: (e as any).species || 'Cattle',
        age: (e as any).age || 'Unknown',
        health: (e as any).health || 'healthy',
        lastCheck: e.date,
        nextVaccination: (e as any).nextVaccination || '',
        yield: (e as any).yield || '',
        note: e.content || '',
      }));
    res.json(entries);
  });

  app.post('/api/livestock', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const entry = {
      id: `livestock_${Date.now()}`,
      farmId: req.body.farmId || '',
      animalTag: req.body.tag || 'Animal',
      species: req.body.species || 'Cattle',
      age: req.body.age || 'Unknown',
      health: req.body.health || 'healthy',
      date: new Date().toISOString(),
      nextVaccination: req.body.nextVaccination || '',
      category: 'OBSERVATION' as const,
      title: `Livestock: ${req.body.tag || 'Animal'}`,
      content: req.body.note || '',
      images: [],
    };
    db.data.farmDiaryEntries.push(entry as any);
    db.saveData();
    res.status(201).json(entry);
  });

  app.patch('/api/livestock/:id', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const entry = db.data.farmDiaryEntries.find(e => e.id === req.params.id);
    if (!entry) return res.status(404).json({ error: 'Livestock record not found.' });
    Object.assign(entry, req.body);
    db.saveData();
    res.json(entry);
  });

  // ── FERTILIZER PLANS ─────────────────────────────────────────────────────
  app.get('/api/fertilizer-plans', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const farmId = req.query.farmId as string;
    const plans = db.data.farmDiaryEntries
      .filter(e => e.category === 'ACTIVITY' && e.title?.toLowerCase().includes('fertilizer'))
      .filter(e => !farmId || e.farmId === farmId)
      .map(e => ({
        id: e.id,
        crop: (e as any).crop || 'Unknown',
        field: (e as any).field || e.farmId || '',
        area: Number((e as any).area) || 1,
        stage: (e as any).stage || 'Vegetative',
        product: (e as any).product || 'NPK',
        planCategory: (e as any).planCategory || 'Balanced',
        dosePerHa: Number((e as any).dosePerHa) || 24,
        applyOn: (e as any).applyOn || e.date,
        note: e.content || '',
      }));
    res.json(plans);
  });

  app.post('/api/fertilizer-plans', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const plan = {
      id: `fert_${Date.now()}`,
      farmId: req.body.farmId || '',
      crop: req.body.crop || '',
      field: req.body.field || '',
      area: Number(req.body.area) || 1,
      stage: req.body.stage || 'Vegetative',
      product: req.body.product || 'NPK',
      planCategory: req.body.category || '',
      dosePerHa: Number(req.body.dosePerHa) || 24,
      applyOn: req.body.applyOn || new Date().toISOString().split('T')[0],
      category: 'ACTIVITY' as const,
      title: `Fertilizer: ${req.body.crop || 'Crop'} - ${req.body.product || 'NPK'}`,
      content: req.body.note || '',
      date: new Date().toISOString(),
      images: [],
    };
    db.data.farmDiaryEntries.push(plan as any);
    db.saveData();
    res.status(201).json(plan);
  });

  // ── YIELD HISTORY ─────────────────────────────────────────────────────────
  app.get('/api/yield-history', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const predictions = db.data.yieldPredictions
      .filter(p => p.userId === user.id)
      .slice(0, 10)
      .map(p => ({
        id: p.id,
        season: new Date(p.createdAt).getFullYear().toString(),
        crop: p.input?.crop || 'Unknown',
        yield: (p.result as any)?.predictedYieldTonnesPerAcre ?? (p.result as any)?.expectedYieldTonnes ?? 0,
        createdAt: p.createdAt,
      }));
    res.json(predictions);
  });

  // ── NEARBY SERVICES ───────────────────────────────────────────────────────
  app.get('/api/nearby-services', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const markets = db.data.markets.slice(0, 10).map((m: any, i: number) => ({
      id: m.id || `market-${i}`,
      name: m.name,
      type: 'mandi',
      address: `${m.district || m.location || ''}, ${m.state || ''}`.trim(),
      distanceKm: Math.round((2 + i * 2.5) * 10) / 10,
      phone: m.phone || '1800-123-4567',
      openNow: m.isActive !== false,
      lat: m.lat,
      lng: m.lng,
    }));
    res.json(markets);
  });

  // ── LEDGER / FINANCIAL ────────────────────────────────────────────────────
  app.get('/api/ledger', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const farmId = req.query.farmId as string;
    const expenses = db.data.expenses
      .filter(e => !farmId || e.farmId === farmId)
      .slice(0, 100)
      .map((e: any) => ({
        id: e.id,
        date: e.date,
        label: e.description || e.category || 'Transaction',
        category: e.category || 'Other',
        amount: Number(e.amount) || 0,
      }));
    res.json(expenses);
  });

  app.post('/api/ledger', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const entry = {
      id: `ledger_${Date.now()}`,
      farmId: req.body.farmId || '',
      date: req.body.date || new Date().toISOString(),
      description: req.body.label || req.body.description || 'Transaction',
      category: (req.body.category || 'OTHER').toUpperCase() as any,
      amount: Math.abs(Number(req.body.amount)) || 0,
    };
    db.data.expenses.push(entry as any);
    db.saveData();
    res.status(201).json(entry);
  });

  // ── SUCCESS STORIES ───────────────────────────────────────────────────────
  app.get('/api/success-stories', (req: Request, res: Response) => {
    // Return from community posts tagged as success stories
    const stories = db.data.communityPosts
      .filter(p => (p as any).isSuccessStory || (p as any).tag === 'success')
      .slice(0, 10)
      .map(p => ({
        id: p.id,
        headline: p.title || p.content?.slice(0, 60) || 'Success Story',
        farmer: p.authorName || 'Farmer',
        village: (p as any).village || '',
        crop: (p as any).crop || 'Crop',
        story: p.content,
        metric: (p as any).metric || 'Improved yield',
      }));
    res.json(stories);
  });

  // ── LEARNING LESSONS ──────────────────────────────────────────────────────
  app.get('/api/lessons', (req: Request, res: Response) => {
    // Static curated lessons (could be extended to a DB collection)
    const lessons = [
      { id: 'lesson-1', title: 'Read a soil test card', topic: 'Soil', durationMin: 12, level: 'Beginner', description: 'Understand pH, NPK and organic carbon before choosing inputs.', progress: 0 },
      { id: 'lesson-2', title: 'Scout for pests early', topic: 'Crop health', durationMin: 18, level: 'Practical', description: 'A field walk checklist for spotting disease before it spreads.', progress: 0 },
      { id: 'lesson-3', title: 'Sell with a market comparison', topic: 'Market', durationMin: 10, level: 'Beginner', description: 'Calculate a realistic net return after transport and fees.', progress: 0 },
      { id: 'lesson-4', title: 'Water your crops efficiently', topic: 'Water', durationMin: 15, level: 'Beginner', description: 'Drip vs flood irrigation – choose the right method for your crop.', progress: 0 },
      { id: 'lesson-5', title: 'Integrated Pest Management (IPM)', topic: 'Crop health', durationMin: 25, level: 'Advanced', description: 'Balance chemicals with biological controls for sustainable pest management.', progress: 0 },
      { id: 'lesson-6', title: 'Government scheme eligibility', topic: 'Policy', durationMin: 8, level: 'Beginner', description: 'Know which PM Kisan, PMFBY or input subsidy schemes you qualify for.', progress: 0 },
    ];
    res.json(lessons);
  });

  // ── CROP LISTINGS ─────────────────────────────────────────────────────────
  app.get('/api/crop-listings', (req: Request, res: Response) => {
    res.json(db.data.cropListings || []);
  });

  app.post('/api/crop-listings', (req: Request, res: Response) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    const listing = {
      id: `listing_${Date.now()}`,
      farmerId: user.id,
      farmerName: user.name,
      createdAt: new Date().toISOString(),
      ...req.body,
    };
    if (!db.data.cropListings) db.data.cropListings = [];
    db.data.cropListings.unshift(listing as any);
    db.saveData();
    res.status(201).json(listing);
  });

  // ── STORAGE FACILITIES ────────────────────────────────────────────────────
  app.get('/api/storage-facilities', (req: Request, res: Response) => {
    res.json(db.data.storageFacilities || []);
  });
}
