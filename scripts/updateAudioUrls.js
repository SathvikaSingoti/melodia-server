require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Song = require('../models/Song');

const AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

async function updateAudioUrls() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected. Updating all songs...');

    const result = await Song.updateMany({}, {
      $set: { audioUrl: AUDIO_URL }
    });

    console.log(`Update successful! Modified ${result.modifiedCount} songs.`);
  } catch (error) {
    console.error('Update error:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

updateAudioUrls();
