const Artist = require('../models/Artist');

exports.getArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const artist = await Artist.findById(id).populate('songs');
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    res.json(artist);
  } catch (error) {
    console.error('Error fetching artist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getArtists = async (req, res) => {
  try {
    const artists = await Artist.find().limit(20);
    res.json(artists);
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleFollow = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const artist = await Artist.findById(id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const index = artist.followers.indexOf(userId);
    if (index === -1) {
      artist.followers.push(userId);
    } else {
      artist.followers.splice(index, 1);
    }
    await artist.save();
    res.json({ followers: artist.followers });
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
