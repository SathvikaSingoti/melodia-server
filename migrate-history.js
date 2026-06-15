require('dotenv').config();
const mongoose = require('mongoose');
const PlayHistory = require('./models/PlayHistory');
const Song = require('./models/Song');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const cursor = PlayHistory.find({ listenedSeconds: { $exists: false } }).populate('song').cursor();

    let count = 0;
    for await (const doc of cursor) {
      if (doc.song && doc.song.duration) {
        doc.listenedSeconds = doc.song.duration;
        doc.completed = true;
      } else if (doc.duration) {
        doc.listenedSeconds = doc.duration;
        doc.completed = true;
      } else {
        doc.listenedSeconds = 180;
        doc.completed = true;
      }
      await doc.save();
      count++;
    }

    console.log(`Successfully migrated ${count} PlayHistory records.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
