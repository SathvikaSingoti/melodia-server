const LikedSong = require('../models/LikedSong');
const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const User = require('../models/User');
const PlayHistory = require('../models/PlayHistory');
const Artist = require('../models/Artist');
const admin = require('../config/firebase');
const { getStorage } = require('firebase-admin/storage');
const { getApps } = require('firebase-admin/app');
const fs = require('fs');
const path = require('path');

exports.getLikedSongs = async (req, res) => {
  try {
    const userId = req.user.id;
    const likedSongs = await LikedSong.find({ user: userId }).populate('song');
    // Map to return just the songs array for the frontend
    const songs = likedSongs.map(ls => ls.song).filter(Boolean);
    res.json(songs);
  } catch (error) {
    console.error('Error fetching liked songs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.likeSong = async (req, res) => {
  try {
    const userId = req.user.id;
    const { songId } = req.body;
    
    const existing = await LikedSong.findOne({ user: userId, song: songId });
    if (!existing) {
      await LikedSong.create({ user: userId, song: songId });
    }
    
    res.json({ message: 'Song liked successfully' });
  } catch (error) {
    console.error('Error liking song:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.unlikeSong = async (req, res) => {
  try {
    const userId = req.user.id;
    const { songId } = req.params;
    await LikedSong.findOneAndDelete({ user: userId, song: songId });
    res.json({ message: 'Song unliked successfully' });
  } catch (error) {
    console.error('Error unliking song:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserPlaylists = async (req, res) => {
  try {
    const userId = req.user.id;
    const playlists = await Playlist.find({ userId: userId }).populate('songs');
    res.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    
    // Only allow users to update their own profile
    if (userId !== req.params.id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { username, avatarBase64, favoriteGenres, favoriteArtists, onboardingCompleted } = req.body;
    
    let updateData = {};
    if (username) updateData.username = username;
    if (favoriteGenres) updateData.favoriteGenres = favoriteGenres;
    if (favoriteArtists) updateData.favoriteArtists = favoriteArtists;
    if (typeof onboardingCompleted === 'boolean') updateData.onboardingCompleted = onboardingCompleted;
    
    if (avatarBase64 && avatarBase64.startsWith('data:image')) {
      const base64EncodedImageString = avatarBase64.split(';base64,').pop();
      const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');
      const filename = `avatars/${userId}_${Date.now()}.jpg`;

      if (getApps().length === 0) {
        // Local fallback if Firebase is not configured
        const publicDir = path.join(__dirname, '../public');
        const avatarsDir = path.join(publicDir, 'avatars');
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
        if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir);
        
        fs.writeFileSync(path.join(publicDir, filename), imageBuffer);
        updateData.avatarUrl = `http://localhost:5000/${filename}`;
      } else {
        // Firebase upload
        const bucket = getStorage().bucket();
        const file = bucket.file(filename);
        
        await file.save(imageBuffer, {
          metadata: { contentType: 'image/jpeg' },
          public: true,
        });
        
        updateData.avatarUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-passwordHash');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    if (userId !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const count = await PlayHistory.countDocuments({ user: userId });

    const history = await PlayHistory.find({ user: userId })
      .sort({ playedAt: -1 })
      .limit(200)
      .populate('song');
      
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Server error fetching history' });
  }
};

exports.addHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    if (userId !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { songId, duration, playedAt } = req.body;
    if (!songId) {
      return res.status(400).json({ message: 'songId is required' });
    }

    const newHistory = await PlayHistory.create({
      user: userId,
      song: songId,
      duration: duration || 0,
      playedAt: playedAt ? new Date(playedAt) : new Date()
    });

    res.json(newHistory);
  } catch (error) {
    console.error('Error adding history:', error);
    res.status(500).json({ message: 'Server error adding history' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    if (userId !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { period } = req.query; // week, month, all
    
    // 1. Calculate Streak (All-time)
    const allHistory = await PlayHistory.find({ user: userId }).sort({ playedAt: -1 });
    
    let streak = 0;
    if (allHistory.length > 0) {
      const datesPlayed = new Set(
        allHistory.map(h => {
          const d = new Date(h.playedAt);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
      );
      
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
      
      let checkDate = datesPlayed.has(todayStr) ? today : (datesPlayed.has(yesterdayStr) ? yesterday : null);
      
      if (checkDate) {
        let currentStreak = 0;
        let d = new Date(checkDate);
        while (true) {
          const dStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          if (datesPlayed.has(dStr)) {
            currentStreak++;
            d.setDate(d.getDate() - 1);
          } else {
            break;
          }
        }
        streak = currentStreak;
      }
    }

    // 2. Filter by period
    let startDate = new Date(0);
    if (period === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const periodHistory = await PlayHistory.find({
      user: userId,
      playedAt: { $gte: startDate }
    }).populate('song');

    const validHistory = periodHistory.filter(h => h.song != null);

    let totalMinutes = 0;
    const genreMap = {};
    const artistMap = {};
    const songMap = {};
    const heatMapData = Array.from({ length: 7 }, () => Array(24).fill(0));

    validHistory.forEach(h => {
      const durationMins = (h.duration || h.song.duration) / 60;
      totalMinutes += durationMins;

      // Heatmap
      const d = new Date(h.playedAt);
      const day = d.getDay();
      const hour = d.getHours();
      heatMapData[day][hour]++;

      // Genre
      const genre = h.song.genre || 'Unknown';
      if (!genreMap[genre]) genreMap[genre] = { count: 0, minutes: 0 };
      genreMap[genre].count++;
      genreMap[genre].minutes += durationMins;

      // Artist
      const artist = h.song.artist || 'Unknown';
      if (!artistMap[artist]) artistMap[artist] = { count: 0, minutes: 0, artistId: h.song.artistId };
      artistMap[artist].count++;
      artistMap[artist].minutes += durationMins;

      // Song
      const songId = h.song._id.toString();
      if (!songMap[songId]) songMap[songId] = { song: h.song, playCount: 0, totalMinutes: 0 };
      songMap[songId].playCount++;
      songMap[songId].totalMinutes += durationMins;
    });

    const genreBreakdown = Object.entries(genreMap)
      .map(([genre, data]) => ({ genre, count: data.count, minutes: data.minutes }))
      .sort((a, b) => b.minutes - a.minutes);

    const topArtists = Object.entries(artistMap)
      .map(([artist, data]) => ({ artist, artistId: data.artistId, count: data.count, minutes: data.minutes }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);

    const topSongs = Object.values(songMap)
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
      .slice(0, 5);

    const topGenre = genreBreakdown.length > 0 ? genreBreakdown[0].genre : "None";

    // Format Heatmap
    const formattedHeatmap = [];
    let maxHourCount = -1;
    let peakHourIndex = 0;
    
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        formattedHeatmap.push({ day: d, hour: h, count: heatMapData[d][h] });
        if (heatMapData[d][h] > maxHourCount) {
          maxHourCount = heatMapData[d][h];
          peakHourIndex = h;
        }
      }
    }

    const ampm = peakHourIndex >= 12 ? 'PM' : 'AM';
    const hr12 = peakHourIndex % 12 || 12;
    const peakHour = `${hr12} ${ampm}`;

    res.json({
      totalMinutes: Math.round(totalMinutes),
      songsPlayed: validHistory.length,
      topGenre,
      streak,
      genreBreakdown,
      topArtists,
      topSongs,
      heatmap: formattedHeatmap,
      peakHour
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const userId = req.user.id;
    if (userId !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const artists = await Artist.find({ followers: userId });
    res.json(artists);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    console.log("DELETE /api/users/:id hit!");
    const userId = req.user.id || req.user._id;
    const paramsId = req.params.id;
    console.log("userId:", userId, "paramsId:", paramsId);

    if (userId.toString() !== paramsId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete related documents
    await LikedSong.deleteMany({ user: userId });
    await Playlist.deleteMany({ userId: userId }); // Note: Playlist schema uses userId
    await PlayHistory.deleteMany({ user: userId });
    
    // Delete user document
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ message: 'Server error deleting account' });
  }
};
