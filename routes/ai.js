const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const verifyJWT = require('../middleware/verifyJWT');

router.use(verifyJWT);
router.post('/generate-playlist', aiController.generatePlaylist);
router.post('/radio', aiController.startRadio);

module.exports = router;
