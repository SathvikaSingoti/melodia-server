const mongoose = require('mongoose');
require('dotenv').config();
const Song = require('../models/Song');

async function fixCovers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const songs = await Song.find({ $or: [{ coverUrl: null }, { coverUrl: '' }, { coverUrl: { $exists: false } }] });
    console.log(`Found ${songs.length} songs missing covers.`);

    let count = 0;
    for (const song of songs) {
      song.coverUrl = `https://picsum.photos/seed/${song._id}/500/500`;
      await song.save();
      count++;
    }

    console.log(`Fixed ${count} covers.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixCovers();
