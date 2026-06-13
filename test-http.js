require('dotenv').config();
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const Song = require('./models/Song');

async function testHttp() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Get a random song to use as seed
  const song = await Song.findOne({});
  mongoose.disconnect();

  if (!song) {
    console.log("No songs found");
    return;
  }

  // Generate valid token
  const token = jwt.sign({ userId: '6a2b953f9a70e3be9d2115a0' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  try {
    console.log(`Sending GET to http://localhost:5000/api/ai/debug`);
    const res = await fetch('http://localhost:5000/api/ai/debug', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (res.ok) {
      console.log("Success:", data);
    } else {
      console.error("HTTP Error:", res.status);
      console.error("Data:", data);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testHttp();
