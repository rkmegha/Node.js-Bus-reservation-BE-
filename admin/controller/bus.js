const busdb = require('../model/bus');

async function addBus(req, res) {
  try {
    const {
      name, busNumber, type, farePerKm, ratings, status,
    } = req.body;
    if (name === undefined || busNumber === undefined || type === undefined
      || farePerKm === undefined || ratings === undefined || status === undefined) {
      res.status(400).json({ success: false, message: 'enter all values' });
    } else {
      const addBusQuery = await busdb.addBus(name, busNumber, type, farePerKm, ratings, status);
      if (addBusQuery.length > 0) {
        res.status(200).json({ success: false, message: 'bus already exists' });
      } else {
        res.status(200).json({ success: true, message: 'bus added' });
      }
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'internal server error' });
  }
}

const getBus = async (req, res) => {
  try {
    const {
      startingPoint, destination, boardingTime, page = 1,
    } = req.body;
    const buses = await busdb.viewBus(startingPoint, destination, boardingTime, page);
    if (buses) {
      res.status(200).json({
        success: true, data: buses, page: `${page}}`,
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
    const currentOffers = await busdb.viewOffers();
    if (currentOffers.length > 0) {
      res.status(200).json({ success: true, data: currentOffers });
    } else {
      res.status(200).json({ success: false, message: 'no offer exists' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'internal server error' });
  }
};

const addOffer = async (req, res) => {
  try {
    const {
      busId, offerName, offerDescription, rate, StartDate, endDate, seatType,
    } = req.body;
    if (!offerName || !offerDescription
      || !rate || !StartDate || !endDate || !seatType) {
      res.status(400).json({ success: false, message: 'enter details' });
    } else {
      const offer = await busdb.addOffer(
        busId,
        offerName,
        offerDescription,
        rate,
        StartDate,
        endDate,
        seatType,
      );
      if (offer) {
        if (busId === undefined) {
          res.status(200).json({ success: true, message: 'offer added for all bus' });
        } else {
          res.status(200).json({ success: true, message: `offer added for ${busId}` });
        }
      } else {
        res.status(200).json({ success: false, message: 'offer exists ' });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err });
  }
};

const viewReview = async (req, res) => {
  try {
    const {
      busId,
    } = req.body;
    const review = await busdb.viewReview(busId);
    if (review.length > 0) {
      res.status(200).json({ success: true, data: review });
    } else {
      res.status(400).json({ success: false, message: 'no reviews' });
    }
  } catch (err) {
    res.status(200).json({ success: false, message: err });
  }
};

module.exports = {
  addBus,
  getBus,
  viewOffers,
  addOffer,
  viewReview,
};
