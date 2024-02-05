const bookBus = require('../model/booking');

const booking = async (req, res) => {
  try {
    const {
      customerId,
      busId,
      date,
      noOfSeats,
      totalAmount,
      status,
      seatsId,
    } = req.body;

    if (customerId === undefined || busId === undefined
    || date === undefined || noOfSeats === undefined || totalAmount === undefined) {
      res.status(400).json({ success: false, message: 'enter all values' });
    }
    const addBooking = await bookBus.booking(
      customerId,
      busId,
      date,
      noOfSeats,
      totalAmount,
      status,
      seatsId,
    );

    if (addBooking.length > 0) {
      res.status(404).json({ success: false, message: 'booking already exists' });
    } else {
      res.status(200).json({ success: true, message: addBooking.message });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'internal server error' });
  }
};

const viewBooking = async (req, res) => {
  try {
    const { date } = req.body;
    const viewBookings = await bookBus.viewBooking(date);
    if (viewBookings.length > 0) {
      res.status(200).json({ success: true, data: viewBookings });
    } else {
      res.status(200).json({ success: false, message: 'no bookings' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'internal server error' });
  }
};
const viewTickets = async (req, res) => {
  try {
    const {
      customerId, busId, bookingId, startDate, endDate, page = 1,
    } = req.body;
    if (!customerId || !busId) {
      res.status(400).json({ success: false, message: 'enter details' });
    } else {
      const tickets = await bookBus.viewTicket(
        customerId,
        busId,
        bookingId,
        startDate,
        endDate,
        page,
      );
      if (tickets) {
        res.status(200).json({
          success: true, data: tickets, page: `${page}`,
        });
      } else {
        res.status(200).json({ success: false, message: 'no tickets' });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err });
  }
};
const bookingCancel = async (req, res) => {
  try {
    const { bookingId, seatsToCancel } = req.body;
    const cancelBooking = await bookBus.cancelBookings(bookingId, seatsToCancel);
    if (cancelBooking) {
      res.status(200).json({ success: true, message: 'booking canceled' });
    } else {
      res.status(400).json({ success: false, message: 'no bookings' });
    }
  } catch (err) {
    console.log(err);
    res.status(200).json({ success: false, message: err });
  }
};

module.exports = {
  booking,
  viewBooking,
  viewTickets,
  bookingCancel,
};
