const bookingdb = require('../../db_connection');

async function viewBooking(date) {
  const db = bookingdb.makeDb();

  try {
    let result;
    const booking = `select customer.name, bus.name as busname, booking.date,
            booking.no_of_seats as noOfSeats, booking.total_amount as totalAmount, booking.status,
            route.starting_point as startingPoint, route.destination, route.boarding_time as boardingTime, route.deboarding_time as deboardingTime from booking
            inner join customer on customer.id = booking.customer_id inner join bus on bus.id = booking.bus_id
            inner join route on bus.id = route.bus_id`;
    if (date != null) {
      const filterByDate = `${booking} where booking.date = ?`;
      result = await db.query(filterByDate, [date]);
    } else {
      result = await db.query(`${booking} where booking.date = current_date() `);
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
  const db = bookingdb.makeDb();
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
      result.data = totalPage;
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
  viewBooking,
  viewTicket,
};
