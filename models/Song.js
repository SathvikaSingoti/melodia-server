const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  artist: {
    type: String,
    required: true,
    trim: true,
  },
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist'
  },
  album: {
    type: String,
    trim: true,
  },
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  },
  genre: {
    type: String,
    trim: true,
  },
  mood: {
    type: String,
    trim: true,
  },
  duration: {
    type: Number, // in seconds
    required: true,
  },
  audioUrl: {
    type: String,
    required: true,
  },
  coverUrl: {
    type: String,
    required: true,
  },
  plays: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

songSchema.index({ genre: 1 });
songSchema.index({ mood: 1 });
songSchema.index({ title: 'text', artist: 'text' });

module.exports = mongoose.model('Song', songSchema);
