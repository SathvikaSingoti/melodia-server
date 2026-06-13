const mongoose = require('mongoose');

async function addIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    console.log('Adding indexes...');
    await db.collection('songs').createIndex({ genre: 1 });
    await db.collection('songs').createIndex({ mood: 1 });
    await db.collection('songs').createIndex({ plays: -1 });
    await db.collection('likedsongs').createIndex({ user: 1, song: 1 }, { unique: true });
    await db.collection('playhistories').createIndex({ user: 1, playedAt: -1 });
    
    console.log('Successfully added indexes!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error adding indexes:', error);
    mongoose.disconnect();
  }
}

addIndexes();
