const mongoose = require('mongoose');
const Song = require('../models/Song');

const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';
const CLIENT_ID = process.env.JAMENDO_CLIENT_ID || 'b51bb939';

async function seedJamendo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const tags = ['folk', 'ambient', 'jazz', 'classical'];
    let insertedCount = 0;

    for (const tag of tags) {
      console.log(`Fetching ${tag} songs...`);
      const response = await fetch(`${JAMENDO_API_URL}/tracks?client_id=${CLIENT_ID}&format=json&limit=25&tags=${tag}&include=musicinfo&audioformat=mp32`);
      const data = await response.json();
      
      const tracks = data.results;
      for (const track of tracks) {
        if (!track.audio || !track.image) continue;

        const exists = await Song.findOne({ title: track.name, artist: track.artist_name });
        if (!exists) {
          await Song.create({
            title: track.name,
            artist: track.artist_name,
            album: track.album_name || 'Single',
            coverUrl: track.image,
            audioUrl: track.audio,
            duration: track.duration,
            genre: tag.charAt(0).toUpperCase() + tag.slice(1),
            mood: 'chill', // default mood
            plays: Math.floor(Math.random() * 1000)
          });
          insertedCount++;
        }
      }
    }

    console.log(`Successfully seeded ${insertedCount} new songs from Jamendo!`);
    mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    mongoose.disconnect();
  }
}

seedJamendo();
