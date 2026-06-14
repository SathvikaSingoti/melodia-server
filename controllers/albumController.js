const Album = require('../models/Album');

exports.getAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const album = await Album.findById(id).populate('songs');
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }
    
    // Find any extra songs by albumId in case the array isn't fully populated
    const Song = require('../models/Song');
    const extraSongs = await Song.find({ albumId: id });
    const allSongs = [...(album.songs || []), ...extraSongs];
    
    // Deduplicate songs by ID
    const uniqueSongs = Array.from(new Map(allSongs.map(s => [s._id.toString(), s])).values());
    album.songs = uniqueSongs;

    // Use first song's coverUrl if album coverUrl is missing
    if (!album.coverUrl && uniqueSongs.length > 0 && uniqueSongs[0].coverUrl) {
      album.coverUrl = uniqueSongs[0].coverUrl;
    }
    
    // Using lean() or converting to object since we modified a mongoose document
    const albumObj = album.toObject ? album.toObject() : album;
    albumObj.songs = uniqueSongs;

    res.json(albumObj);
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
