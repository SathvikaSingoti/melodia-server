const Album = require('../models/Album');

exports.getAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const album = await Album.findById(id).populate('songs');
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }
    res.json(album);
  } catch (error) {
    console.error('Error fetching album:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAlbums = async (req, res) => {
  try {
    const albums = await Album.find().populate('artist', 'name');
    res.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
