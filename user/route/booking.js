const express = require('express');

const router = express.Router();
const booking = require('../controller/booking');

const { verifyToken } = require('../../middleWare/middleWare');

router.post('/addBooking', verifyToken, booking.booking);
router.get('/viewBooking', verifyToken, booking.viewBooking);
router.get('/viewTicket', verifyToken, booking.viewTickets);
router.get('/adBooking', verifyToken, booking.booking);
router.put('/cancelBooking', verifyToken, booking.bookingCancel);

module.exports = router;
