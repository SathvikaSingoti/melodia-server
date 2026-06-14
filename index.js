require('dotenv').config();
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

// Passport
const passport = require('./config/passport');
app.use(passport.initialize());

// Serve static files (for local avatar uploads when Firebase is not configured)
const path = require('path');
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

const { MongoMemoryServer } = require('mongodb-memory-server');

// Database connection
async function startServer() {
  try {
    let mongoUri = process.env.MONGO_URI || '';
    
    // Use memory server if default placeholder is detected or MONGO_URI is missing
    if (!mongoUri || mongoUri.includes('your_jwt_secret') || mongoUri.includes('mongodb+srv://user:password')) {
      console.log('Detected placeholder MongoDB URI. Using mongodb-memory-server for testing...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

startServer();

module.exports = app;
