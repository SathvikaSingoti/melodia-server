const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');

router.get('/search', songController.searchSongs);
router.get('/genres', songController.getGenres);
router.get('/', songController.getSongs);
router.get('/:id', songController.getSong);
router.patch('/:id/play', songController.incrementPlays);

module.exports = router;
