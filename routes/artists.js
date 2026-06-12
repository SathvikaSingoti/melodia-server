const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artistController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);
router.get('/', artistController.getArtists);
router.get('/:id', artistController.getArtist);
router.post('/:id/follow', artistController.toggleFollow);

module.exports = router;
