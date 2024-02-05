const express = require('express');

const booking = require('../controller/booking');
const { verifyToken } = require('../../middleWare/middleWare');

const router = express.Router();

router.get('/viewBooking', verifyToken, booking.viewBooking);

router.get('/viewTicket', verifyToken, booking.viewTickets);

module.exports = router;
