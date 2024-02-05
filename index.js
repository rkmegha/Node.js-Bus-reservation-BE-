const bodyParser = require('body-parser');

const express = require('express');

const app = express();

app.use(express.json());
const cors = require('cors');

app.use(cors());

const adminBus = require('./admin/route/bus');
const adminAuthentication = require('./admin/route/authentication');
const adminBooking = require('./admin/route/booking');

app.use('/adminAuth', adminAuthentication);
app.use('/adminBus', adminBus);
app.use('/adminBooking', adminBooking);

const userBus = require('./user/route/bus');
const userBooking = require('./user/route/booking');
const userAuthentication = require('./user/route/authentication');

app.use('/userBus', userBus);
app.use('/userBooking', userBooking);
app.use('/userAuth', userAuthentication);

app.use('/uploads', express.static('uploads'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3001);
