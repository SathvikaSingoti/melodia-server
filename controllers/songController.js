const Song = require('../models/Song');

exports.getSongs = async (req, res) => {
  try {
    const { genre, mood } = req.query;
    const query = {};

    if (genre) {
      let searchGenre = genre;
      if (genre.toLowerCase() === 'hip-hop') searchGenre = 'hiphop';
      else if (genre.toLowerCase() === 'r&b') searchGenre = 'rnb';
      
      query.genre = new RegExp(searchGenre.replace(/[-& ]/g, '.*'), 'i');
    }
    if (mood) {
      query.mood = mood;
    }

    const songs = await Song.find(query);
    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json(song);
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchSongs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const escapedQ = q.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
    const regex = new RegExp(escapedQ, 'i');
    
    let queryObj = {};
    if (req.query.filter === 'genre') {
      queryObj = { genre: regex };
    } else if (req.query.filter === 'artist') {
      queryObj = { artist: regex };
    } else if (req.query.filter === 'duration') {
      if (q === 'short') queryObj = { duration: { $lt: 120 } };
      else if (q === 'medium') queryObj = { duration: { $gte: 120, $lte: 240 } };
      else if (q === 'long') queryObj = { duration: { $gt: 240 } };
    } else {
      queryObj = {
        $or: [
          { title: regex },
          { artist: regex }
        ]
      };
    }

    const songs = await Song.find(queryObj);
    res.json(songs);
  } catch (error) {
    console.error('Error searching songs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getGenres = async (req, res) => {
  try {
    const genres = await Song.aggregate([
      { $match: { genre: { $exists: true, $ne: "" } } },
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $match: { count: { $gt: 0 } } },
      { $project: { _id: 0, genre: "$_id", count: 1 } },
      { $sort: { count: -1 } }
    ]);
    res.json(genres);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.incrementPlays = async (req, res) => {
  try {
    const songId = req.params.id;
    await Song.findByIdAndUpdate(songId, { $inc: { plays: 1 } });
    res.json({ message: 'Plays incremented' });
  } catch (error) {
    console.error('Error incrementing plays:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
