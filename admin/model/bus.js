const busdb = require('../../db_connection');

async function addBus(name, busNumber, type, farePerKm, ratings, status) {
  const db = busdb.makeDb();
  try {
    let result;
    if (busNumber !== null) {
      const bus = 'select bus_number from bus where bus_number = ?';
      const checkBus = await db.query(bus, [busNumber]);
      if (checkBus.length > 0) {
        result = checkBus;
      } else {
        const addBusQuery = 'insert into bus (name, bus_number, type, fare_per_km, ratings, status) values(?,?,?,?,?,?)';
        result = await db.query(
          addBusQuery,
          [name, busNumber, type, farePerKm, ratings, status],
        );
      }
    }
    return result;
  } catch (err) {
    console.log(err);
    return false;
  } finally {
    await db.close();
  }
}

async function viewBus(startingPoint, destination, boardingTime, page) {
  const db = busdb.makeDb();
  try {
    const result = {};
    const getAllBus = `select bus.id, bus.name, bus.bus_number, bus.type, bus.fare_per_km, bus.ratings,
            bus.status,route.starting_point, route.destination, route.boarding_time, route.deboarding_time,
            booking_amenities.m_ticket, booking_amenities.cctv,
            booking_amenities.reading_light, booking_amenities.blanket,booking_amenities.charging_point,
            booking_amenities.emergency_contacts
            from bus inner join route on bus.id = route.bus_id inner join booking_amenities on
            booking_amenities.bus_id = bus.id`;
    const getCount = `select  count(*) totalCount from bus inner join route on bus.id = route.bus_id inner join booking_amenities on
    booking_amenities.bus_id = bus.id `;
    const offset = (page - 1) * 10;

    if (startingPoint != null && destination != null && boardingTime != null) {
      const getBusByTime = `${getAllBus} WHERE route.starting_point = ? AND route.destination = ? and route.boarding_time = ? limit ${offset}, 10`;
      const getBuses = await db.query(
        getBusByTime,
        [startingPoint, destination, boardingTime, page],
      );
      result.data = getBuses;
      const totalPageData = await db.query(`${getCount} WHERE route.starting_point = ?
                        AND route.destination = ? and route.boarding_time = ?`, [startingPoint, destination, boardingTime]);
      const totalPage = Math.ceil(totalPageData[0].totalCount / 10);

      result.totalPage = totalPage;
    } else if (startingPoint != null && destination != null && boardingTime === undefined) {
      const count = `${getCount}  WHERE route.starting_point = ? AND route.destination = ?`;
      const getBusByRoute = `${getAllBus} WHERE route.starting_point = ? AND route.destination = ? limit ${offset}, 10`;
      const getBuses = await db.query(getBusByRoute, [startingPoint, destination, page]);
      result.data = getBuses;
      const totalPageData = await db.query(count, [startingPoint, destination]);
      const totalPage = Math.ceil(totalPageData[0].totalCount / 10);
      result.totalPage = totalPage;
    } else if (startingPoint != null && destination === undefined && boardingTime === undefined) {
      const count = `${getCount} WHERE route.starting_point = ?`;
      const startPointOnly = `${getAllBus} WHERE route.starting_point = ? limit ${offset}, 10`;
      const getBuses = await db.query(startPointOnly, [startingPoint, page]);
      result.data = getBuses;
      const totalPageData = await db.query(count, [startingPoint]);
      const totalPage = Math.ceil(totalPageData[0].totalCount / 10);
      result.totalPage = totalPage;
    } else {
      const getBuses = await db.query(`${getAllBus} limit ${offset}, 10`, [page]);
      result.data = getBuses;
      const totalPageData = await db.query(`${getCount}`);
      const totalPage = Math.ceil(totalPageData[0].totalCount / 10);
      result.totalPage = totalPage;
    }
    return result;
  } catch (err) {
    console.log(err);
    return false;
  } finally {
    await db.close();
  }
}

async function viewOffers() {
  const db = busdb.makeDb();

  try {
    const viewQuery = `select * from offers where
               current_date() <= validity_ends and current_date()>= validaity_start`;
    const viewOffer = await db.query(viewQuery);
    return viewOffer;
  } catch (err) {
    console.log(err);
    return false;
  } finally {
    await db.close();
  }
}

async function addOffer(busId, offerName, offerDescription, rate, StartDate, endDate, seatType) {
  const db = busdb.makeDb();
  let result;
  try {
    if (busId !== null) {
      const checkOffer = await db.query(`select * from offers where bus_id = ? and validity_ends > ? ;
      `, [busId, StartDate]);
      if (checkOffer.length <= 0) {
        const singleBus = `insert into offers
            (bus_id,offer_name, offer_description, rate, validaity_start, validity_ends, conditions) values(?, ?, ?, ?, ?, ? ,?) `;

        result = await db.query(
          singleBus,
          [busId, offerName, offerDescription, rate, StartDate, endDate, seatType],
        );
      }
    } else {
      const checkOffer = await db.query(`select * from offers where validity_ends > ? and bus_id = null;
        `, [StartDate]);
      if (checkOffer.length < 0) {
        const allBus = `insert into offers
                    (offer_name, offer_description, rate, validaity_start, validity_ends, conditions) values(?, ?, ?, ?, ? ,?) `;
        result = await db.query(
          allBus,
          [offerName, offerDescription, rate, StartDate, endDate, seatType],
        );
      }
    }
    return result;
  } catch (err) {
    console.log(err);
    return false;
  } finally {
    await db.close();
  }
}

async function viewReview(busId) {
  const db = busdb.makeDb();
  try {
    let result;
    const allReview = `select bus.name, customer.name as customer, bus_review.reiew as review,
    bus_review.suggestions, DATE_FORMAT(bus_review.created, '%Y-%m-%d') as date
    from bus_review inner join bus on bus_review.bus_id = bus.id
    inner join customer on bus_review.cust_id = customer.id`;

    if (busId !== undefined) {
      const getReview = `${allReview} where bus_id = ?`;
      result = await db.query(getReview, busId);
    } else {
      result = await db.query(allReview);
    }
    return result;
  } catch (err) {
    console.log(err);
    return false;
  } finally {
    await db.close();
  }
}

module.exports = {
  addBus,
  viewBus,
  viewOffers,
  addOffer,
  viewReview,
};
