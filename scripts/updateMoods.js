require('dotenv').config();
const mongoose = require('mongoose');
const Song = require('../models/Song');

async function updateMoods() {
  try {
    let mongoUri = process.env.MONGO_URI;
    if (mongoUri.includes('your_jwt_secret') || mongoUri.includes('mongodb+srv://user:password')) {
      console.log('Skipping DB update: Detected placeholder MongoDB URI.');
      process.exit(0);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB. Updating moods...');

    const result = await Song.updateMany(
      { genre: { $regex: /^(pop|folk|indie)$/i } },
      { $set: { mood: 'Happy' } }
    );

    console.log(`Update complete. Modified ${result.modifiedCount} songs.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating moods:', error);
    process.exit(1);
  }
}

updateMoods();
