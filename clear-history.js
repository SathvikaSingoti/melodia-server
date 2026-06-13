require('dotenv').config();
const mongoose = require('mongoose');
const PlayHistory = require('./models/PlayHistory');

async function clearHistory() {
  try {
    let mongoUri = process.env.MONGO_URI;
    if (!mongoUri || mongoUri.includes('your_jwt_secret') || mongoUri.includes('mongodb+srv://user:password')) {
      console.log('Skipping because MONGO_URI is not set or placeholder');
      return;
    }

    await mongoose.connect(mongoUri);
    const result = await PlayHistory.deleteMany({});
    console.log(`Deleted ${result.deletedCount} history entries.`);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

clearHistory();
