const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');

// Public routes for albums
router.get('/', albumController.getAlbums);
router.get('/:id', albumController.getAlbum);

module.exports = router;
