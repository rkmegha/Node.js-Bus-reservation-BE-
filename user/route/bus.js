const express = require('express');

const router = express.Router();

const bus = require('../controller/bus');

const { verifyToken } = require('../../middleWare/middleWare');

router.get('/viewBuses', verifyToken, bus.getBus);
router.get('/viewOffers', verifyToken, bus.viewOffers);
router.all('/viewSeats', verifyToken, bus.viewSeats);
router.post('/addReview', verifyToken, bus.addReview);

module.exports = router;
