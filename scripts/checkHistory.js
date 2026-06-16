const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const PlayHistory = require('../models/PlayHistory');
require('../models/Song');

async function checkHistory() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const count = await PlayHistory.countDocuments();
    const latest = await PlayHistory.find().sort({ playedAt: -1 }).limit(10).populate('song');
    console.log(`Total history entries: ${count}`);
    latest.forEach((h, i) => {
      console.log(`${i+1}. Song: ${h.song?.title}, Listened: ${h.listenedSeconds}, Completed: ${h.completed}, At: ${h.playedAt}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkHistory();
