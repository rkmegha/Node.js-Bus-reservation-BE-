const express = require('express');

const authentication = require('../controller/authentication');

const router = express.Router();

router.post('/login', authentication.checkLogin);

module.exports = router;
