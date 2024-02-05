const adminDb = require('../../db_connection');

async function login(username, password) {
  const db = adminDb.makeDb(adminDb);
  try {
    let result;
    if (username !== undefined || password !== undefined) {
      const loginQr = 'select username, password from customer where username = ? and password = ? and is_admin = 1';
      result = await db.query(loginQr, [username, password]);
    }
    return result;
  } catch (err) {
    return false;
  } finally {
    await db.close();
  }
}

module.exports = {
  login,
};
