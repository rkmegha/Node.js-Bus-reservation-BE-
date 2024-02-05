const jwt = require('jsonwebtoken');
const adminDb = require('../model/authentication');

const checkLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username === undefined || password === undefined) {
      res.status(400).json({ success: false, message: 'enter username and password' });
    }
    const checkLoginQuery = await adminDb.login(username, password);
    if (checkLoginQuery.length > 0) {
      if (checkLoginQuery[0].username === username
        && checkLoginQuery[0].password === password) {
        const { id } = checkLoginQuery[0];
        const token = jwt.sign({ id }, 'userkey', { expiresIn: 3000 });
        res.status(200).json({ success: true, data: token, message: 'login successfull' });
      } else {
        res.status(400).json({ success: false, message: 'enter valid input and output' });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'internal server error' });
  }
};
module.exports = {
  checkLogin,
};
