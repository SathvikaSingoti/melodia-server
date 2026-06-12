require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Song = require('../models/Song');
const Artist = require('../models/Artist');

let MongoMemoryServer;
try {
  MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
} catch (e) {}

const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || 'e0b966f3';
const GENRES = ['pop', 'hiphop', 'electronic', 'indie', 'rock', 'rnb', 'classical', 'jazz', 'ambient', 'folk'];

function getMoodForGenre(genre) {
  const g = genre.toLowerCase();
  if (['pop', 'hiphop', 'electronic', 'rock'].includes(g)) return 'Energetic';
  if (['rnb', 'jazz', 'folk', 'indie', 'ambient', 'classical'].includes(g)) return 'Chill';
  if (g === 'pop' || g === 'folk') return 'Happy'; // Override rule from prompt logic
  return 'Chill';
}

async function fetchTracks(genre) {
  try {
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=15&tags=${genre}&include=musicinfo&audioformat=mp32&imagesize=500`;
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
          mood: getMoodForGenre(genre),
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

async function fetchArtistInfo(artistName) {
  try {
    const url = `https://api.jamendo.com/v3.0/artists/?client_id=${JAMENDO_CLIENT_ID}&format=json&name=${encodeURIComponent(artistName)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.results && data.results.length > 0) {
      return {
        bio: data.results[0].shorturl || 'An amazing artist on Jamendo.', // Jamendo v3.0 artists doesn't always have a full bio, shorturl is a fallback
        imageUrl: data.results[0].image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'
      };
    }
  } catch (error) {
    console.error(`Error fetching artist info for ${artistName}:`, error.message);
  }
  return {
    bio: 'An amazing artist.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'
  };
}

async function seed() {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    if (mongoUri.includes('your_jwt_secret') || mongoUri.includes('mongodb+srv://user:password')) {
      if (MongoMemoryServer) {
        const mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
      } else {
        console.error('MongoMemoryServer is required.');
        process.exit(1);
      }
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    console.log('Fetching 150+ songs from Jamendo API...');
    let allTracks = [];
    for (const genre of GENRES) {
      console.log(`Fetching ${genre}...`);
      const tracks = await fetchTracks(genre);
      allTracks = allTracks.concat(tracks);
    }

    const finalTracks = allTracks.slice(0, 150);
    const insertedSongs = await Song.insertMany(finalTracks);
    console.log(`Successfully inserted ${insertedSongs.length} new songs!`);

    console.log('Grouping all songs by artist and creating Artist documents...');
    const allExistingSongs = await Song.find({});
    
    // Group songs by artist name
    const songsByArtist = {};
    for (const song of allExistingSongs) {
      const name = song.artist;
      if (!songsByArtist[name]) songsByArtist[name] = [];
      songsByArtist[name].push(song);
    }

    let processedCount = 0;
    const totalArtists = Object.keys(songsByArtist).length;

    for (const [artistName, artistSongs] of Object.entries(songsByArtist)) {
      // Create artist
      let artist = await Artist.findOne({ name: artistName });
      
      if (!artist) {
        const info = await fetchArtistInfo(artistName);
        const monthlyListeners = Math.floor(Math.random() * (5000000 - 1000 + 1)) + 1000;
        
        artist = await Artist.create({
          name: artistName,
          bio: info.bio,
          genre: artistSongs[0].genre, // Use genre of their first song
          imageUrl: info.imageUrl,
          monthlyListeners: monthlyListeners,
          songs: artistSongs.map(s => s._id)
        });
      } else {
        // Update existing artist with new songs
        const existingSongIds = artist.songs.map(id => id.toString());
        const newSongIds = artistSongs.map(s => s._id.toString()).filter(id => !existingSongIds.includes(id));
        if (newSongIds.length > 0) {
          artist.songs.push(...newSongIds);
          await artist.save();
        }
      }

      // Update songs with artistId
      await Song.updateMany(
        { _id: { $in: artistSongs.map(s => s._id) } },
        { $set: { artistId: artist._id } }
      );

      processedCount++;
      if (processedCount % 10 === 0) {
        console.log(`Processed ${processedCount}/${totalArtists} artists...`);
      }
    }

    console.log(`Successfully processed all artists and linked songs!`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
