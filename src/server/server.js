const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const moment = require('moment');
const { getDistance } = require('geolib');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Google Apps Script configuration
const GOOGLE_SCRIPT_CONFIG = {
  url: 'https://script.google.com/macros/s/AKfycbwPRvQY2EdmV38kl2FABcrC6aL5X2i38Xt1m5FRgnagN5KGWrofHHqh_Eeg2GD6HHWo/exec',
  headers: {
    'Content-Type': 'application/json'
  }
};

// Function to sync donation data to Google Apps Script
async function syncDonationToGoogleScript(donationData) {
  try {
    const payload = {
      donorName: donationData.donorName,
      foodType: donationData.foodType,
      quantity: donationData.quantity,
      imageUrl: donationData.imageUrl,
      safetyScore: donationData.safetyScore,
      safetyStatus: donationData.safetyStatus,
      ngoName: donationData.ngoName || '',
      pickupStatus: donationData.pickupStatus || 'pending'
    };

    console.log('Syncing donation to Google Apps Script:', payload);

    const response = await axios.post(
      GOOGLE_SCRIPT_CONFIG.url,
      payload,
      { headers: GOOGLE_SCRIPT_CONFIG.headers }
    );

    console.log('Google Apps Script sync successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Google Apps Script sync failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
    }
  }
});

// Database setup
const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('donor', 'ngo', 'admin')),
      organization TEXT,
      phone TEXT,
      address TEXT,
      latitude REAL,
      longitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Food donations table
    db.run(`CREATE TABLE IF NOT EXISTS food_donations (
      id TEXT PRIMARY KEY,
      donor_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      food_type TEXT NOT NULL CHECK(food_type IN ('veg', 'non-veg')),
      quantity INTEGER NOT NULL,
      unit TEXT DEFAULT 'plates',
      preparation_time DATETIME NOT NULL,
      storage_condition TEXT NOT NULL,
      location TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      image_path TEXT,
      ai_safety_score REAL,
      ai_status TEXT,
      ai_confidence REAL,
      ai_explanation TEXT,
      safety_verified BOOLEAN DEFAULT 0,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'claimed', 'completed', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donor_id) REFERENCES users (id)
    )`);

    // Donation claims table
    db.run(`CREATE TABLE IF NOT EXISTS donation_claims (
      id TEXT PRIMARY KEY,
      donation_id TEXT NOT NULL,
      ngo_id TEXT NOT NULL,
      pickup_time DATETIME,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'picked_up', 'completed', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donation_id) REFERENCES food_donations (id),
      FOREIGN KEY (ngo_id) REFERENCES users (id)
    )`);

    // Food safety feedback table
    db.run(`CREATE TABLE IF NOT EXISTS food_safety_feedback (
      id TEXT PRIMARY KEY,
      donation_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      quality_rating INTEGER CHECK(quality_rating >= 1 AND quality_rating <= 5),
      feedback TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donation_id) REFERENCES food_donations (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Hygiene checklist responses
    db.run(`CREATE TABLE IF NOT EXISTS hygiene_checklist (
      id TEXT PRIMARY KEY,
      donation_id TEXT NOT NULL,
      cooked_safe_time BOOLEAN NOT NULL,
      stored_covered BOOLEAN NOT NULL,
      no_human_contact BOOLEAN NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donation_id) REFERENCES food_donations (id)
    )`);

    console.log('Database initialized successfully');
  });
};

// AI Food Safety Scanner (Simulation)
class AIFoodSafetyScanner {
  static analyzeFoodImage(imagePath, foodType, preparationTime, storageCondition) {
    // Simulate AI analysis delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const analysis = this.performAnalysis(imagePath, foodType, preparationTime, storageCondition);
        resolve(analysis);
      }, 2000); // 2 second delay to simulate processing
    });
  }

  static performAnalysis(imagePath, foodType, preparationTime, storageCondition) {
    // Simulate image analysis results (in real implementation, this would use computer vision)
    const imageQuality = Math.random() * 100;
    const discoloration = Math.random() > 0.7; // 30% chance of visible issues
    const moistureLevel = Math.random() * 100;
    const textureScore = Math.random() * 100;

    // Calculate time-based safety
    const hoursSincePreparation = moment().diff(moment(preparationTime), 'hours');
    
    // Food-specific safety rules
    const safetyRules = {
      veg: { maxHours: 8, immediateThreshold: 6 },
      'non-veg': { maxHours: 4, immediateThreshold: 2 }
    };

    const rules = safetyRules[foodType];
    let timeSafetyScore = 100;
    
    if (hoursSincePreparation > rules.maxHours) {
      timeSafetyScore = 0;
    } else if (hoursSincePreparation > rules.immediateThreshold) {
      timeSafetyScore = 50 - ((hoursSincePreparation - rules.immediateThreshold) * 10);
    }

    // Image-based analysis
    let imageSafetyScore = 100;
    if (discoloration) imageSafetyScore -= 30;
    if (moistureLevel > 80) imageSafetyScore -= 20;
    if (textureScore < 40) imageSafetyScore -= 25;

    // Storage condition impact
    const storageMultipliers = {
      'refrigerated': 1.2,
      'room temperature': 1.0,
      'covered': 1.1,
      'uncovered': 0.8
    };
    
    const storageMultiplier = storageMultipliers[storageCondition.toLowerCase()] || 1.0;
    imageSafetyScore *= storageMultiplier;

    // Calculate final score
    const finalScore = Math.max(0, Math.min(100, (timeSafetyScore + imageSafetyScore) / 2));
    
    // Determine status
    let status, confidence;
    if (finalScore >= 80) {
      status = 'Safe to Consume';
      confidence = 0.85 + Math.random() * 0.1;
    } else if (finalScore >= 50) {
      status = 'Consume Immediately';
      confidence = 0.7 + Math.random() * 0.15;
    } else {
      status = 'Not Safe to Consume';
      confidence = 0.9 + Math.random() * 0.08;
    }

    // Generate explanation
    const explanations = [];
    if (hoursSincePreparation > rules.maxHours) {
      explanations.push(`Time exceeded for ${foodType} food (${hoursSincePreparation} hours)`);
    }
    if (discoloration) explanations.push('Visible discoloration detected');
    if (moistureLevel > 80) explanations.push('Excessive moisture visible');
    if (textureScore < 40) explanations.push('Texture degradation observed');
    if (finalScore >= 80) explanations.push('No visible spoilage indicators');

    return {
      safetyScore: Math.round(finalScore),
      status,
      confidence: Math.round(confidence * 100) / 100,
      explanation: explanations.join('; '),
      imageAnalysis: {
        quality: Math.round(imageQuality),
        discoloration,
        moistureLevel: Math.round(moistureLevel),
        textureScore: Math.round(textureScore)
      }
    };
  }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, organization, phone, address, latitude, longitude } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    db.run(
      `INSERT INTO users (id, name, email, password, role, organization, phone, address, latitude, longitude) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, email, hashedPassword, role, organization, phone, address, latitude, longitude],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Email already registered' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }

        const token = jwt.sign({ id: userId, email, role }, 'your-secret-key', { expiresIn: '7d' });
        
        res.status(201).json({
          message: 'Registration successful',
          token,
          user: { id: userId, name, email, role, organization }
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, 'your-secret-key', { expiresIn: '7d' });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          phone: user.phone,
          address: user.address,
          latitude: user.latitude,
          longitude: user.longitude
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create food donation
app.post('/api/donations', authenticateToken, upload.single('foodImage'), async (req, res) => {
  try {
    const {
      title,
      description,
      foodType,
      quantity,
      unit,
      preparationTime,
      storageCondition,
      location,
      latitude,
      longitude,
      hygieneChecked
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Food image is required' });
    }

    // Validate hygiene checklist
    if (!hygieneChecked) {
      return res.status(400).json({ error: 'Hygiene checklist must be completed' });
    }

    const donationId = uuidv4();
    const imagePath = `/uploads/${req.file.filename}`;

    // Process image with sharp (resize and optimize)
    await sharp(req.file.path)
      .resize(800, 600, { fit: 'inside' })
      .jpeg({ quality: 85 })
      .toFile(req.file.path);

    // Create donation record
    db.run(
      `INSERT INTO food_donations 
       (id, donor_id, title, description, food_type, quantity, unit, preparation_time, 
        storage_condition, location, latitude, longitude, image_path) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [donationId, req.user.id, title, description, foodType, quantity, unit || 'plates', 
       preparationTime, storageCondition, location, latitude, longitude, imagePath],
      async function(err) {
        if (err) {
          console.error('Donation creation error:', err);
          return res.status(500).json({ error: 'Failed to create donation' });
        }

        // Record hygiene checklist
        db.run(
          `INSERT INTO hygiene_checklist 
           (id, donation_id, cooked_safe_time, stored_covered, no_human_contact) 
           VALUES (?, ?, ?, ?, ?)`,
          [uuidv4(), donationId, true, true, true] // Default true since checked
        );

        // Start AI analysis
        try {
          const analysis = await AIFoodSafetyScanner.analyzeFoodImage(
            req.file.path,
            foodType,
            preparationTime,
            storageCondition
          );

          // Update donation with AI results
          db.run(
            `UPDATE food_donations SET 
             ai_safety_score = ?, ai_status = ?, ai_confidence = ?, ai_explanation = ?,
             safety_verified = ? 
             WHERE id = ?`,
            [
              analysis.safetyScore,
              analysis.status,
              analysis.confidence,
              analysis.explanation,
              analysis.safetyScore >= 50 ? 1 : 0, // Only approve if score >= 50
              donationId
            ]
          );

          // Notify nearby NGOs if donation is approved
          if (analysis.safetyScore >= 50) {
            io.emit('new_donation', {
              donationId,
              title,
              location,
              safetyScore: analysis.safetyScore
            });

            // Auto-sync to Google Apps Script
            const donor = req.user;
            const syncData = {
              donorName: donor.name,
              foodType: foodType,
              quantity: quantity,
              imageUrl: `${req.protocol}://${req.get('host')}${imagePath}`,
              safetyScore: analysis.safetyScore,
              safetyStatus: analysis.status,
              ngoName: '',
              pickupStatus: 'pending'
            };

            // Fire and forget - don't block response
            syncDonationToGoogleScript(syncData).then(result => {
              if (result.success) {
                console.log('Auto-sync to Google Apps Script successful for donation:', donationId);
              } else {
                console.warn('Auto-sync to Google Apps Script failed for donation:', donationId, result.error);
              }
            }).catch(error => {
              console.warn('Auto-sync error for donation:', donationId, error.message);
            });
          }

          res.status(201).json({
            message: 'Donation created successfully',
            donation: {
              id: donationId,
              title,
              imagePath,
              aiAnalysis: analysis
            }
          });

        } catch (aiError) {
          console.error('AI analysis error:', aiError);
          res.status(201).json({
            message: 'Donation created, AI analysis failed',
            donation: { id: donationId, title }
          });
        }
      }
    );
  } catch (error) {
    console.error('Donation creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get nearby donations (for NGOs)
app.get('/api/donations/nearby', authenticateToken, (req, res) => {
  const { latitude, longitude, radius = 10 } = req.query;
  const userLat = parseFloat(latitude);
  const userLon = parseFloat(longitude);

  if (!userLat || !userLon) {
    return res.status(400).json({ error: 'Location coordinates required' });
  }

  db.all(
    `SELECT fd.*, u.name as donor_name, u.phone as donor_phone, u.organization as donor_org
     FROM food_donations fd
     JOIN users u ON fd.donor_id = u.id
     WHERE fd.safety_verified = 1 AND fd.status = 'approved'
     ORDER BY fd.created_at DESC`,
    [], (err, donations) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch donations' });
      }

      // Filter by distance and add distance info
      const nearbyDonations = donations
        .map(donation => {
          if (donation.latitude && donation.longitude) {
            const distance = getDistance(
              { latitude: userLat, longitude: userLon },
              { latitude: donation.latitude, longitude: donation.longitude }
            ) / 1000; // Convert to km

            return { ...donation, distance: Math.round(distance * 100) / 100 };
          }
          return donation;
        })
        .filter(donation => !donation.distance || donation.distance <= radius)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));

      res.json({ donations: nearbyDonations });
    }
  );
});

// Get user's donations
app.get('/api/donations/my', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT * FROM food_donations WHERE donor_id = ? ORDER BY created_at DESC`,
    [userId],
    (err, donations) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch donations' });
      }
      res.json({ donations });
    }
  );
});

// Claim donation
app.post('/api/donations/:id/claim', authenticateToken, (req, res) => {
  if (req.user.role !== 'ngo' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only NGOs can claim donations' });
  }

  const donationId = req.params.id;
  const { pickupTime } = req.body;

  db.get('SELECT * FROM food_donations WHERE id = ? AND status = "approved"', [donationId], (err, donation) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found or not available' });
    }

    const claimId = uuidv4();

    db.run(
      `INSERT INTO donation_claims (id, donation_id, ngo_id, pickup_time) VALUES (?, ?, ?, ?)`,
      [claimId, donationId, req.user.id, pickupTime],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to claim donation' });
        }

        // Update donation status
        db.run('UPDATE food_donations SET status = "claimed" WHERE id = ?', [donationId]);

        // Notify donor
        io.emit('donation_claimed', { donationId, claimId });

        res.json({
          message: 'Donation claimed successfully',
          claimId
        });
      }
    );
  });
});

// Get analytics data
app.get('/api/analytics', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const queries = {
    totalDonations: 'SELECT COUNT(*) as count FROM food_donations',
    safeDonations: 'SELECT COUNT(*) as count FROM food_donations WHERE safety_verified = 1',
    totalClaims: 'SELECT COUNT(*) as count FROM donation_claims',
    mealsSaved: 'SELECT SUM(quantity) as total FROM food_donations WHERE status = "completed"'
  };

  const results = {};
  let completed = 0;

  Object.keys(queries).forEach(key => {
    db.get(queries[key], [], (err, row) => {
      if (err) {
        results[key] = 0;
      } else {
        results[key] = row.count || row.total || 0;
      }
      completed++;
      
      if (completed === Object.keys(queries).length) {
        res.json(results);
      }
    });
  });
});

// Manual sync endpoint - posts donation data to Google Apps Script
app.post('/api/sync/google-apps-script', authenticateToken, async (req, res) => {
  try {
    const {
      donorName,
      foodType,
      quantity,
      imageUrl,
      safetyScore,
      safetyStatus,
      ngoName,
      pickupStatus
    } = req.body;

    if (!donorName || !foodType || !quantity || !safetyScore || !safetyStatus) {
      return res.status(400).json({ 
        error: 'Missing required fields: donorName, foodType, quantity, safetyScore, safetyStatus' 
      });
    }

    const syncData = {
      donorName,
      foodType,
      quantity,
      imageUrl: imageUrl || '',
      safetyScore,
      safetyStatus,
      ngoName: ngoName || '',
      pickupStatus: pickupStatus || 'pending'
    };

    const result = await syncDonationToGoogleScript(syncData);

    if (result.success) {
      res.json({
        message: 'Data synced to Google Apps Script successfully',
        data: result.data
      });
    } else {
      res.status(500).json({
        error: 'Failed to sync data to Google Apps Script',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Manual sync error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Auto-sync endpoint for donation creation
app.post('/api/sync/donation/:id', authenticateToken, async (req, res) => {
  try {
    const donationId = req.params.id;

    // Get donation details with donor info
    db.get(
      `SELECT fd.*, u.name as donor_name, u.organization as donor_org
       FROM food_donations fd
       JOIN users u ON fd.donor_id = u.id
       WHERE fd.id = ?`,
      [donationId],
      async (err, donation) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch donation data' });
        }

        if (!donation) {
          return res.status(404).json({ error: 'Donation not found' });
        }

        const syncData = {
          donorName: donation.donor_name,
          foodType: donation.food_type,
          quantity: donation.quantity,
          imageUrl: `${req.protocol}://${req.get('host')}${donation.image_path}`,
          safetyScore: donation.ai_safety_score || 0,
          safetyStatus: donation.ai_status || 'Unknown',
          ngoName: '',
          pickupStatus: 'pending'
        };

        const result = await syncDonationToGoogleScript(syncData);

        if (result.success) {
          res.json({
            message: 'Donation synced to Google Apps Script successfully',
            data: result.data
          });
        } else {
          res.status(500).json({
            error: 'Failed to sync donation to Google Apps Script',
            details: result.error
          });
        }
      }
    );
  } catch (error) {
    console.error('Donation sync error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  initDatabase();
  console.log(`Achayapathra server running on port ${PORT}`);
});