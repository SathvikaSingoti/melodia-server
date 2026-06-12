require('dotenv').config();
const mongoose = require('mongoose');

async function dropOldIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    await mongoose.connection.collection('likedsongs').dropIndex('userId_1_songId_1');
    console.log('Successfully dropped stale index: userId_1_songId_1');
    
  } catch (error) {
    if (error.codeName === 'IndexNotFound') {
      console.log('Index already dropped or not found, which is fine.');
    } else {
      console.error('Error dropping index:', error.message);
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

dropOldIndex();
