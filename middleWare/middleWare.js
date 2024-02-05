const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader === undefined) {
    res.status(404).json({ error: 'no token provided' });
  } else {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, 'userkey', (err) => {
      if (err) {
        res.status(400).json({ success: false, message: err.message });
      } else {
        next();
      }
    });
  }
}

module.exports = {
  verifyToken,
};
