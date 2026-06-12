const mongoose = require('mongoose');

const likedSongSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true,
  },
}, { timestamps: true });

// Prevent duplicate likes for the same song by the same user
likedSongSchema.index({ user: 1, song: 1 }, { unique: true });

module.exports = mongoose.model('LikedSong', likedSongSchema);
