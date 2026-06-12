const mongoose = require('mongoose');
require('dotenv').config();
const Song = require('../models/Song');
const Artist = require('../models/Artist');
const Album = require('../models/Album');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const songs = await Song.find({});
    console.log(`Processing ${songs.length} songs...`);

    // 1. Artists mapping
    const artistsMap = new Map();
    for (const song of songs) {
      if (!artistsMap.has(song.artist)) {
        let artist = await Artist.findOne({ name: song.artist });
        if (!artist) {
          artist = new Artist({
            name: song.artist,
            genre: song.genre || 'Pop',
            imageUrl: song.coverUrl,
            monthlyListeners: Math.floor(Math.random() * 50000) + 1000
          });
          await artist.save();
          console.log(`Created new artist: ${artist.name}`);
        }
        artistsMap.set(song.artist, artist);
      }
      
      const artistDoc = artistsMap.get(song.artist);
      song.artistId = artistDoc._id;
      
      // Update artist's songs array if not present
      if (!artistDoc.songs.includes(song._id)) {
        artistDoc.songs.push(song._id);
        await artistDoc.save();
      }
    }

    // 2. Albums mapping
    const albumsMap = new Map();
    for (const song of songs) {
      const albumName = song.album || `${song.title} - Single`;
      const albumKey = `${albumName}_${song.artist}`;
      
      if (!albumsMap.has(albumKey)) {
        albumsMap.set(albumKey, {
          name: albumName,
          artist: song.artist,
          artistId: song.artistId,
          coverUrl: song.coverUrl,
          songs: []
        });
      }
      
      albumsMap.get(albumKey).songs.push(song);
    }

    // Create Album documents and update songs
    for (const [key, albumData] of albumsMap.entries()) {
      let album = await Album.findOne({ name: albumData.name, artist: albumData.artist });
      if (!album) {
        album = new Album({
          name: albumData.name,
          artist: albumData.artist,
          artistId: albumData.artistId,
          coverUrl: albumData.coverUrl,
          songs: albumData.songs.map(s => s._id),
          releaseYear: 2024
        });
        await album.save();
        console.log(`Created album: ${album.name} by ${album.artist}`);
      } else {
        albumData.songs.forEach(s => {
          if (!album.songs.includes(s._id)) {
            album.songs.push(s._id);
          }
        });
        await album.save();
      }

      for (const song of albumData.songs) {
        song.albumId = album._id;
        await song.save();
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
