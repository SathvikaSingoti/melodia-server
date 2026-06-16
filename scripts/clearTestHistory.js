const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PlayHistory = require('../models/PlayHistory');

async function clearTestHistory() {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    console.log('Clearing all PlayHistory records...');
    const result = await PlayHistory.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} history records.`);

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing history:', err);
    process.exit(1);
  }
}

clearTestHistory();
