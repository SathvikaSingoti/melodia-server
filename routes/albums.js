const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);
router.get('/', albumController.getAlbums);
router.get('/:id', albumController.getAlbum);

module.exports = router;
