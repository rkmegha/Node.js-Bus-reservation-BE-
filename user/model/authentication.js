const userdb = require('../../db_connection');

async function createUser(name, username, password, email, age, contactNumber, gender) {
  const db = userdb.makeDb();
  try {
    let result;
    if (email !== undefined && name !== undefined && username !== undefined
      && password !== undefined && age !== undefined && contactNumber !== undefined
      && gender !== undefined) {
      const users = 'select * from customer where email = ?';
      const checkUser = await db.query(users, [email]);
      if (checkUser.length > 0) {
        result = checkUser;
      } else {
        const qr = 'insert into customer (name, username, password, email, age, contact_number, gender) values(?, ?, ?, ?, ?, ?, ?)';
        const addUser = await db.query(
          qr,
          [name, username, password, email, age, contactNumber, gender],
        );
        result = addUser;
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

async function login(username, password) {
  const db = userdb.makeDb();
  try {
    let result;
    if (username !== undefined && password !== undefined) {
      const loginQr = 'select username, password from customer where username=? and password=?';
      const userLogin = await db.query(loginQr, [username, password]);
      result = userLogin;
    }
    return result;
  } catch (err) {
    console.log(err);
    return false;
  } finally {
    await db.close();
  }
}

async function userImage(name, contactNumber, image, id) {
  const db = userdb.makeDb();
  try {
    let result;
    if ((!name || !contactNumber) && (image !== undefined && id !== undefined)) {
      const addImage = 'update customer set image = ? where id = ?';
      const uploadImg = await db.query(addImage, [image.originalname, id]);
      result = uploadImg;
    } else {
      const editProfile = 'update customer set name = ?, contact_number = ?, image = ?  where id = ?';
      const profileImage = await db.query(
        editProfile,
        [name, contactNumber, image.originalname, id],
      );
      result = profileImage;
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
  createUser, login, userImage,
};
