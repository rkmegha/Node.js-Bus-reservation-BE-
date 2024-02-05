const express = require('express');

const bus = require('../controller/bus');
const { verifyToken } = require('../../middleWare/middleWare');

const router = express.Router();

router.post('/addBus', verifyToken, bus.addBus);

router.get('/viewBuses', verifyToken, bus.getBus);

router.get('/viewOffers', verifyToken, bus.viewOffers);

router.post('/addOffer', verifyToken, bus.addOffer);

router.get('/viewReview', verifyToken, bus.viewReview);

module.exports = router;
