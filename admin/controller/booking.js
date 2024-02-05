const bookingdb = require('../model/booking');

const viewBooking = async (req, res) => {
  try {
    const { date } = req.body;
    const viewBookings = await bookingdb.viewBooking(date);
    if (viewBookings.length > 0) {
      res.status(200).json({ success: true, data: viewBookings });
    } else {
      res.status(200).json({ success: true, message: 'no bookings' });
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
      const tickets = await bookingdb.viewTicket(
        customerId,
        busId,
        bookingId,
        startDate,
        endDate,
        page,
      );
      if (tickets) {
        res.status(200).json({
          success: true, data: tickets, page: `${page}}`,
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
module.exports = {
  viewBooking,
  viewTickets,
};
