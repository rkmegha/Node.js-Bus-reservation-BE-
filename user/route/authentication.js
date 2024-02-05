const express = require('express');
const multer = require('../../middleWare/multer');

const router = express.Router();

const auth = require('../controller/authentication');
const { verifyToken } = require('../../middleWare/middleWare');

router.post('/updateProfile', verifyToken, multer.upload.single('image'), auth.upadteImage);
router.post('/signup', auth.registerUser);
router.post('/login', auth.checkLogin);

module.exports = router;
