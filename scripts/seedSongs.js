require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Song = require('../models/Song');

const songsToSeed = [
  {
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    genre: "Pop",
    mood: "Energetic",
    duration: 200,
    audioUrl: "https://firebasestorage.googleapis.com/v0/b/placeholder/o/blinding_lights.mp3",
    coverUrl: "https://picsum.photos/seed/blindinglights/400/400",
    plays: 0
  },
  {
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    genre: "Pop",
    mood: "Happy",
    duration: 203,
    audioUrl: "https://firebasestorage.googleapis.com/v0/b/placeholder/o/levitating.mp3",
    coverUrl: "https://picsum.photos/seed/levitating/400/400",
    plays: 0
  },
  {
    title: "SICKO MODE",
    artist: "Travis Scott",
    album: "Astroworld",
    genre: "Hip-Hop",
    mood: "Energetic",
    duration: 312,
    audioUrl: "https://firebasestorage.googleapis.com/v0/b/placeholder/o/sickomode.mp3",
    coverUrl: "https://picsum.photos/seed/sickomode/400/400",
    plays: 0
  },
  {
    title: "Sunflower",
    artist: "Post Malone",
    album: "Spider-Man OST",
    genre: "Pop",
    mood: "Happy",
    duration: 158,
    audioUrl: "https://firebasestorage.googleapis.com/v0/b/placeholder/o/sunflower.mp3",
    coverUrl: "https://picsum.photos/seed/sunflower/400/400",
    plays: 0
  },
  {
    title: "bad guy",
    artist: "Billie Eilish",
    album: "When We All Fall Asleep",
    genre: "Pop",
    mood: "Chill",
    duration: 194,
    audioUrl: "https://firebasestorage.googleapis.com/v0/b/placeholder/o/badguy.mp3",
    coverUrl: "https://picsum.photos/seed/badguy/400/400",
    plays: 0
  },
  {
    title: "Blueberry Faygo",
    artist: "Lil Mosey",
    album: "Certified Hitmaker",
    genre: "Hip-Hop",
    mood: "Chill",
    duration: 163,
    audioUrl: "https://firebasestorage.googleapis.com/v0/b/placeholder/o/blueberryfaygo.mp3",
    coverUrl: "https://picsum.photos/seed/blueberryfaygo/400/400",
    plays: 0
  },
  {
    title: "Starboy",
    artist: "The Weeknd",
    album: "Starboy",
    genre: "R&B",
    mood: "Energetic",
    duration: 230,
    audioUrl: "https://firebasestorage.googleapis.com/v0/b/placeholder/o/starboy.mp3",
    coverUrl: "https://picsum.photos/seed/starboy/400/400",
    plays: 0
  },
  {
    title: "Heat Waves",
    artist: "Glass Animals",
    album: "Dreamland",
    genre: "Indie",
    mood: "Chill",
    duration: 238,
    audioUrl: "https://firebasestorage.googleapis.com/v0/b/placeholder/o/heatwaves.mp3",
    coverUrl: "https://picsum.photos/seed/heatwaves/400/400",
    plays: 0
  },
  {
    title: "Peaches",
    artist: "Justin Bieber",
    album: "Justice",
    genre: "Pop",
    mood: "Happy",
    duration: 198,
    audioUrl: "https://firebasestorage.googleapis.com/v0/b/placeholder/o/peaches.mp3",
    coverUrl: "https://picsum.photos/seed/peaches/400/400",
    plays: 0
  },
  {
    title: "montero",
    artist: "Lil Nas X",
    album: "Montero",
    genre: "Pop",
    mood: "Energetic",
    duration: 137,
    audioUrl: "https://firebasestorage.googleapis.com/v0/b/placeholder/o/montero.mp3",
    coverUrl: "https://picsum.photos/seed/montero/400/400",
    plays: 0
  }
];

async function seedSongs() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    console.log('Clearing existing songs...');
    await Song.deleteMany({});
    
    console.log('Inserting 10 new songs...');
    await Song.insertMany(songsToSeed);
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

seedSongs();
