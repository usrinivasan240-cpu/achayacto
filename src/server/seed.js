const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Database setup
const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
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
      )`, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

const seedUser = async () => {
  try {
    // Initialize database first
    console.log('Initializing database...');
    await initDatabase();
    console.log('Database initialized');

    const email = 'srinivasanu876@gmail.com';
    const password = '123456';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    // Insert user
    db.run(
      `INSERT INTO users (id, name, email, password, role, organization, phone, address, latitude, longitude) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, 'Srinivasan', email, hashedPassword, 'admin', 'Achayapathra', '', '', null, null],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            console.log('User already exists in database');
          } else {
            console.error('Error creating user:', err);
          }
          db.close();
          process.exit(1);
        }
        
        console.log('User created successfully:');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Role: admin');
        console.log('Name: Srinivasan');
        
        db.close();
        process.exit(0);
      }
    );
  } catch (error) {
    console.error('Seeding error:', error);
    db.close();
    process.exit(1);
  }
};

seedUser();
