const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);
router.get('/:id/liked', userController.getLikedSongs);
router.post('/:id/liked', userController.likeSong);
router.delete('/:id/liked/:songId', userController.unlikeSong);
router.get('/:id/playlists', userController.getUserPlaylists);
router.put('/:id', userController.updateUser);
router.get('/:id/history', userController.getHistory);
router.post('/:id/history', userController.addHistory);
router.get('/:id/following', userController.getFollowing);
router.get('/:id/stats', userController.getStats);
router.delete('/:id', userController.deleteUser);

module.exports = router;
