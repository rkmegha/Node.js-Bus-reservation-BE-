const busDb = require('../model/bus');

const getBus = async (req, res) => {
  try {
    const {
      startingPoint, destination, boardingTime, page = 1,
    } = req.body;
    const buses = await busDb.viewBus(startingPoint, destination, boardingTime, page);
    if (buses.length > 0) {
      res.status(200).json({
        success: 'true', data: buses[0], totalPage: buses[1], page: `${page}/${buses[1]}`,
      });
    } else {
      res.status(400).json({ success: false, message: 'no bus available' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'internal server error' });
  }
};

const viewOffers = async (req, res) => {
  try {
    const currentOffers = await busDb.viewOffers();
    if (currentOffers.length > 0) {
      res.status(200).json({ success: true, data: currentOffers });
    } else {
      res.status(200).json({ success: true, message: 'no offers' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'internal server error' });
  }
};

const viewSeats = async (req, res) => {
  try {
    const {
      date,
    } = req.body;
    if (!date) {
      res.status(400).json({ success: false, message: 'enter the date ' });
    } else {
      const addBooking = await busDb.viewSeats(
        date,
      );
      if (addBooking.length < 0) {
        res.status(404).json({ success: false, message: 'no seats available' });
      } else {
        res.status(200).json({ success: true, data: addBooking.message });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'internal server error' });
  }
};

const addReview = async (req, res) => {
  try {
    const {
      busId, customerId, review, suggestions,
    } = req.body;
    if (busId === undefined || customerId === undefined
      || review === undefined) {
      res.status(400).json({ success: false, message: 'enter all details' });
    } else {
      const reviewAdded = await busDb.busReview(busId, customerId, review, suggestions);
      if (reviewAdded) {
        res.status(200).json({ success: true, message: 'review added' });
      } else {
        res.status(400).json({ success: false, message: 'error occured' });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getBus,
  viewOffers,
  viewSeats,
  addReview,
};
