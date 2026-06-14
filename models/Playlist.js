const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  coverUrl: {
    type: String,
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
  }],
  isAIGenerated: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

playlistSchema.index({ userId: 1 });

module.exports = mongoose.model('Playlist', playlistSchema);
