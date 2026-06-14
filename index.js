const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://project-nkv6d.vercel.app',
    'https://project-q9u65.vercel.app'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection middleware for serverless compatibility
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    let mongoUri = process.env.MONGO_URI || '';
    
    // Use memory server if default placeholder is detected or MONGO_URI is missing
    if (!mongoUri || mongoUri.includes('your_jwt_secret') || mongoUri.includes('mongodb+srv://user:password')) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      console.log('Detected placeholder MongoDB URI. Using mongodb-memory-server for testing...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Failed to connect to database in middleware:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Passport
const passport = require('./config/passport');
app.use(passport.initialize());

// Serve static files (for local avatar uploads when Firebase is not configured)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/songs', require('./routes/songs'));
app.use('/api/playlists', require('./routes/playlists'));
app.use('/api/users', require('./routes/users'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/artists', require('./routes/artists'));
app.use('/api/albums', require('./routes/albums'));

// Health check
app.use((req, res, next) => { res.on('finish', () => { if (res.statusCode === 404) console.log('404 Logger:', req.method, req.originalUrl); }); next(); });

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

if (process.env.NODE_ENV !== 'production') {
  // Try connecting immediately for local dev to fail fast if config is wrong
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }).catch(err => {
    console.error('Failed to start local server:', err);
  });
}

module.exports = app;

