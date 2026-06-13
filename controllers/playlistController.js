const Playlist = require('../models/Playlist');

exports.createPlaylist = async (req, res) => {
  try {
    console.log('POST /api/playlists req.body:', req.body);
    const userId = req.user.id;
    const { name, songs, coverUrl } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const playlist = await Playlist.create({
      userId,
      name,
      songs: songs || [],
      coverUrl: coverUrl || ''
    });

    res.status(201).json(playlist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllPlaylists = async (req, res) => {
  try {
    const { aiGenerated, limit, userId } = req.query;
    const query = {};
    if (aiGenerated) query.isAIGenerated = aiGenerated === 'true';
    if (userId) query.userId = userId;
    
    let playlistsQuery = Playlist.find(query).sort({ createdAt: -1 });
    if (limit) playlistsQuery = playlistsQuery.limit(parseInt(limit));
    
    const playlists = await playlistsQuery.populate('songs').lean();
    playlists.forEach(p => {
      if (p.songs) {
        p.songs = p.songs.filter((song, index, self) =>
          index === self.findIndex((t) => t._id.toString() === song._id.toString())
        );
      }
    });
    res.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await Playlist.findById(id).populate('songs').lean();
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (playlist.songs) {
      playlist.songs = playlist.songs.filter((song, index, self) =>
        index === self.findIndex((t) => t._id.toString() === song._id.toString())
      );
    }
    res.json(playlist);
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) return res.status(400).json({ message: 'Name is required' });
    
    const playlist = await Playlist.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    ).populate('songs').lean();
    
    if (playlist && playlist.songs) {
      playlist.songs = playlist.songs.filter((song, index, self) =>
        index === self.findIndex((t) => t._id.toString() === song._id.toString())
      );
    }
    
    res.json(playlist);
  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addSongToPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    const playlist = await Playlist.findByIdAndUpdate(
      id,
      { $addToSet: { songs: songId } },
      { new: true }
    ).populate('songs').lean();
    
    if (playlist && playlist.songs) {
      playlist.songs = playlist.songs.filter((song, index, self) =>
        index === self.findIndex((t) => t._id.toString() === song._id.toString())
      );
    }
    
    res.json(playlist);
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const { id, songId } = req.params;
    const playlist = await Playlist.findByIdAndUpdate(
      id,
      { $pull: { songs: songId } },
      { new: true }
    ).populate('songs').lean();
    
    if (playlist && playlist.songs) {
      playlist.songs = playlist.songs.filter((song, index, self) =>
        index === self.findIndex((t) => t._id.toString() === song._id.toString())
      );
    }
    
    res.json(playlist);
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await Playlist.findByIdAndDelete(id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
