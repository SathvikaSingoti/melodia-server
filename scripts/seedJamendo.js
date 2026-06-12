require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Song = require('../models/Song');

// If memory server is needed, we import it
let MongoMemoryServer;
try {
  MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
} catch (e) {
  // It's a dev dependency, handle gracefully
}

const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || 'e0b966f3';
const GENRES = ['pop', 'hiphop', 'electronic', 'indie', 'rnb', 'classical', 'rock'];

async function fetchTracks(genre) {
  try {
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=8&tags=${genre}&include=musicinfo&audioformat=mp32&imagesize=500`;
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.results) {
      return data.results.map(track => {
        let trackGenre = genre;
        if (track.musicinfo && track.musicinfo.tags && track.musicinfo.tags.genres && track.musicinfo.tags.genres.length > 0) {
          trackGenre = track.musicinfo.tags.genres[0];
        }
        
        return {
          title: track.name || 'Unknown Title',
          artist: track.artist_name || 'Unknown Artist',
          album: track.album_name || 'Single',
          genre: trackGenre,
          mood: trackGenre, // Use genre as a proxy for mood to ensure diversity
          duration: parseInt(track.duration) || 180,
          audioUrl: track.audio,
          coverUrl: track.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
        };
      }).filter(t => t.audioUrl);
    }
    return [];
  } catch (error) {
    console.error(`Error fetching genre ${genre}:`, error.message);
    return [];
  }
}

async function seed() {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    // Check if we need to use memory server
    if (mongoUri.includes('your_jwt_secret') || mongoUri.includes('mongodb+srv://user:password')) {
      if (MongoMemoryServer) {
        const mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
        console.log('Using MongoMemoryServer for seeding...');
      } else {
        console.error('MongoMemoryServer is not available but required due to placeholder URI.');
        process.exit(1);
      }
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    console.log('Clearing existing songs collection...');
    await Song.deleteMany({});

    console.log('Fetching songs from Jamendo API...');
    let allTracks = [];
    for (const genre of GENRES) {
      console.log(`Fetching ${genre}...`);
      const tracks = await fetchTracks(genre);
      allTracks = allTracks.concat(tracks);
    }

    // Shuffle array just to mix genres up a bit
    allTracks.sort(() => Math.random() - 0.5);

    // Limit strictly to 50 tracks
    const finalTracks = allTracks.slice(0, 50);

    await Song.insertMany(finalTracks);
    console.log(`Successfully inserted ${finalTracks.length} Jamendo songs into database!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
