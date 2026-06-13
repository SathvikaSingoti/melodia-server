require('dotenv').config();
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAI() {
  await mongoose.connect(process.env.MONGO_URI);
  const Song = require('./models/Song');
  const allSongs = await Song.find({});
  const catalogInfo = allSongs
    .map(song => `ID: ${song._id.toString()} | "${song.title}" by ${song.artist} (${song.genre}, Mood: ${song.mood || 'unknown'})`)
    .join('\n');
    
  console.log(`Loaded ${allSongs.length} songs for catalog.`);
  
  const prompt = `User wants: 'chill vibes'. \nFrom this song catalog:\n[${catalogInfo}]\nPick the 6 most fitting songs. Return ONLY a JSON array of song IDs. Do not include any markdown, backticks, or explanation. Only return a raw valid JSON array of strings.`;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    console.log("Sending to Gemini...");
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    console.log("Raw response:", text);
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const suggestedSongIds = JSON.parse(text);
    console.log("Parsed array:", suggestedSongIds);
  } catch (error) {
    console.error("Gemini Error:", error);
  } finally {
    mongoose.disconnect();
  }
}

testAI();
