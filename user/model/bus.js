const busdb = require('../../db_connection');

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

async function viewSeats(
  date,
) {
  const db = busdb.makeDb();
  try {
    let messg;
    let offerCost = 0;
    const bookBus = `select seats.bus_id as busId,seats.id, (seats.rate + route.distance * bus.fare_per_km) AS seatCost,seat_type as seatType
                from seats inner join bus on seats.bus_id = bus.id
                inner join route on route.bus_id = bus.id
                where seats.id not in (select ticket.seats_id from booking
                inner join bus on bus.id = booking.bus_id
                inner join ticket on booking.id = ticket.booking_id
                inner join seats on ticket.seats_id = seats.id
                where booking.date = ? and ticket.status != "cancelled"
                )`;
    const checkBooking = await db.query(bookBus, [date]);
    if (checkBooking.length > 0) {
      const key = 'offerPrice';

      const viewOfferbyDate = `select bus_id as busId, rate, conditions as seatType from offers where
            current_date() <= validity_ends and current_date()>= validaity_start`;

      const offer = await db.query(viewOfferbyDate);
      const notNullBusId = [];
      const allBusOffer = [];

      if (offer.length > 0) {
        const checkNull = offer.find((e) => e.busId !== null);
        if (checkNull !== undefined) {
          notNullBusId.push(offer.find((e) => e.busId !== null));
        }
        const checkAll = offer.find((e) => e.busId === null);
        if (checkAll !== undefined) {
          allBusOffer.push(offer.find((e) => e.busId === null));
        }
        if (notNullBusId.length > 0) {
          const offerRateforBus = (notNullBusId[0].rate) / 100;

          for (let off = 0; off < checkBooking.length; off += 1) {
            if (notNullBusId[0].busId === checkBooking[off].busId) {
              if (checkBooking[off].seatType === offer[0].seatType) {
                offerCost = (parseInt(checkBooking[off].seatCost, 10)
                              - parseInt(checkBooking[off].seatCost, 10) * offerRateforBus);
                checkBooking[off][key] = offerCost;
              } else if (offer[0].seatType === 'all') {
                offerCost = (parseInt(checkBooking[off].seatCost, 10)
                - parseInt(checkBooking[off].seatCost, 10) * offerRateforBus);
                checkBooking[off][key] = offerCost;
              } else {
                offerCost = 0;
                checkBooking[off][key] = offerCost;
              }
            }
          }
        } else if (allBusOffer.length > 0) {
          const allBusOfferRate = (allBusOffer[0].rate) / 100;

          for (let off = 0; off < checkBooking.length; off += 1) {
            if (allBusOffer[0].seatType === checkBooking[off].seatType) {
              offerCost = (parseInt(checkBooking[off].seatCost, 10)
                        - parseInt(checkBooking[off].seatCost, 10) * allBusOfferRate);
              checkBooking[off][key] = offerCost;
            } else if (offer[0].seatType === 'all') {
              offerCost = (parseInt(checkBooking[off].seatCost, 10)
                        - parseInt(checkBooking[off].seatCost, 10) * allBusOfferRate);
              checkBooking[off][key] = offerCost;
            } else {
              checkBooking[off][key] = offerCost;
            }
          }
        }
      } else {
        for (let i = 0; i < checkBooking.length; i += 1) {
          checkBooking[i][key] = offerCost;
        }
      }
      if (checkBooking.length > 0) {
        messg = {
          message: checkBooking,
        };
      }
    } else {
      messg = 'No seats available';
    }

    return messg;
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
             current_date() <= validity_ends and current_date()>= validaity_start `;
    const viewOffer = await db.query(viewQuery);
    return viewOffer;
  } catch (err) {
    console.log(err);
    return false;
  } finally {
    await db.close();
  }
}

async function busReview(busId, customerId, review, suggestions) {
  const db = busdb.makeDb();
  try {
    let result;
    if (busId !== undefined || customerId !== undefined
      || review !== undefined || suggestions !== undefined) {
      const insertReview = 'insert into bus_review(bus_id, cust_id, reiew, suggestions) values (?, ?, ?, ?)';
      result = await db.query(insertReview, [busId, customerId, review, suggestions]);
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
  viewBus,
  viewOffers,
  viewSeats,
  busReview,
};
