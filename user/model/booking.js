const bookingDb = require('../../db_connection');

async function booking(
  customerId,
  busId,
  date,
  noOfSeats,
  totalAmount,
  bookingStatus,
  seatsId,
) {
  const db = bookingDb.makeDb();
  try {
    let messg;
    let bookingId;
    const bookBus = `select seats.id, (seats.rate + route.distance * bus.fare_per_km) AS seatCost
                  from seats inner join bus on seats.bus_id = bus.id
                  inner join route on route.bus_id = bus.id
                  where seats.id not in (select ticket.seats_id from booking
                  inner join bus on bus.id = booking.bus_id
                  inner join ticket on booking.id = ticket.booking_id
                  inner join seats on ticket.seats_id = seats.id
                  where bus.id = ? and booking.date = ? and ticket.status != "cancelled"
                  )`;
    const checkBooking = await db.query(bookBus, [busId, date]);
    if (checkBooking.length > 0) {
      const noOfSeat = noOfSeats;
      let insertionDone = false;
      for (let i = 0; i < seatsId.length; i += 1) {
        const seats = seatsId[i];
        const tempArray = checkBooking.filter((x) => x.id === seats.id);
        if (tempArray.length > 0) {
          if (!insertionDone) {
            const bookingQuery = 'insert into booking (customer_id, bus_id, date, no_of_seats, total_amount, status) values (?, ?, ?, ?, ?, ?)';
            db.query(
              bookingQuery,
              [customerId, busId, date, noOfSeat, totalAmount, bookingStatus],
            );
            insertionDone = true;
          }
        }
      }
      const bookingIdQuery = `select id from booking where customer_id = ?
                   and date = ? and bus_id = ?`;
      const bookingIdResult = await db.query(bookingIdQuery, [customerId, date, busId]);
      checkBooking.forEach(async (i) => {
        seatsId.forEach(async (seats) => {
          if (i.id === seats.id) {
            bookingIdResult.forEach(async (st) => {
              bookingId = st.id;
            });
            const addTicket = 'insert into ticket (bus_id, booking_id, seats_id, status, passenger_name, passenger_email, passenger_phone,passenger_age) values (?, ?, ?, ?, ?, ?, ?, ?)';
            await db.query(
              addTicket,
              [busId, bookingId, i.id, seats.status, seats.passengerName,
                seats.passengerEmail, seats.passengerPhone, seats.passengerAge],
            );
          }
        });
      });
      if (bookingId !== undefined) {
        messg = { message: 'Seats Booked Successfully' };
      } else {
        messg = { message: 'Selected seats are booked already' };
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

async function viewBooking(date) {
  const db = bookingDb.makeDb();
  let result;
  try {
    const filterByDate = `select customer.name, bus.id, bus.name as busName, booking.date,
      booking.no_of_seats as noOfSeats, booking.total_amount as totalAmount, booking.status,
      route.starting_point as startingPoint, route.destination, route.boarding_time as boardingTime, route.deboarding_time as deboardingTime from booking
      inner join customer on customer.id = booking.customer_id inner join bus on bus.id = booking.bus_id
      inner join route on bus.id = route.bus_id`;
    if (date != null) {
      result = await db.query(`${filterByDate} where booking.date = ?`, [date]);
    } else {
      result = await db.query(`${filterByDate} where booking.date = current_date()`);
    }
    return result;
  } catch (err) {
    console.log(err);
    return false;
  } finally {
    await db.close();
  }
}
async function viewTicket(customerId, busId, bookingId, startDate, endDate, page) {
  const db = bookingDb.makeDb();
  try {
    const result = {};
    const count = `select count(*) totalCount from ticket inner join booking on ticket.booking_id = booking.id
    inner join bus on booking.bus_id = bus.id inner join route on 
    route.bus_id = bus.id inner join customer on customer.id = booking.customer_id `;

    const query = `select bus.name as busName, route.starting_point, route.destination,
                  booking.date, ticket.id as ticketNumber, ticket.seats_id, ticket.passenger_name,
                  ticket.passenger_email, ticket.passenger_phone, ticket.passenger_age
                  from ticket inner join booking on ticket.booking_id = booking.id
                  inner join bus on booking.bus_id = bus.id inner join route on 
                  route.bus_id = bus.id inner join customer on customer.id = booking.customer_id`;

    const offset = (page - 1) * 10;

    if (!startDate || !endDate) {
      const ticketQuery = `${query} where customer.id = ? and bus.id = ? and booking.id = ? limit ${offset}, 10`;
      const tickets = await db.query(ticketQuery, [customerId, busId, bookingId, page]);
      result.data = tickets;
      const totalPageData = await db.query(`${count} where customer.id = ? and bus.id = ? and booking.id = ?`, [customerId, busId, bookingId]);
      const totalPage = Math.ceil(totalPageData[0].totalCount / 10);
      result.totalPage = totalPage;
    }
    if (startDate !== undefined && endDate !== undefined) {
      const dateView = `select bus.name as busName, route.starting_point, route.destination, booking.date,
      ticket.id AS ticketNumber, ticket.seats_id, ticket.passenger_name, ticket.passenger_email,
      ticket.passenger_phone, ticket.passenger_age from ticket inner join booking on ticket.booking_id = booking.id
      inner join bus on booking.bus_id = bus.id inner join route on route.bus_id = bus.id
      inner join customer on customer.id = booking.customer_id
      where customer.id = ? and bus.id = ? and booking.date between ? and ?
      limit ${offset}, 10`;
      const tickets = await db.query(
        dateView,
        [customerId, busId, startDate, endDate, page],
      );
      result.data = tickets;
      const totalPageData = await db.query(`${count} where customer.id = ? and bus.id = ? and
                 booking.date between ? and ?`, [customerId, busId, startDate, endDate]);
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
async function cancelBookings(bookingId, seatsToCancel) {
  const db = bookingDb.makeDb();
  try {
    const selectTicket = 'select seats_id from ticket where booking_id = ? and status = "booked"';
    const bookedSeats = await db.query(selectTicket, [bookingId]);

    if (bookedSeats.length > 0) {
      if (seatsToCancel.length > 0) {
        const updateTicket = 'update ticket set status = "cancelled" where booking_id = ? and seats_id in (?)';
        const cancelBookingQuery = 'update booking set status = "cancelled" where id = ?';
        const seatBooked = [];
        for (let i = 0; i < bookedSeats.length; i += 1) {
          seatBooked.push(bookedSeats[i].seats_id);
        }
        const eqaual = seatBooked.filter((e) => seatsToCancel.includes(e));
        if (seatsToCancel.length === seatBooked.length
            && seatBooked.every((value) => seatsToCancel.includes(value))) {
          await db.query(cancelBookingQuery, [bookingId]);
          await db.query(updateTicket, [bookingId, seatsToCancel]);
        } else if (eqaual.length > 0) {
          db.query(updateTicket, [bookingId, seatsToCancel]);
        }
      }
    } else {
      return false;
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  } finally {
    await db.close();
  }
}
module.exports = {
  booking,
  viewBooking,
  viewTicket,
  cancelBookings,
};
