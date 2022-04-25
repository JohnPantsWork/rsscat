const { pool } = require('../../util/rdb');

async function checkEmailExist(email) {
  try {
    const [result] = await pool.query('SELECT email FROM user WHERE email = ?', [email]);
    if (result.length > 0) {
      return true;
    }
    return false;
  } catch (err) {
    console.error(err);
    return true;
  }
}

async function selectHashedPassword(provider, email) {
  try {
    const [result] = await pool.query('SELECT password,username,id FROM user WHERE provider = ? AND email = ?', [provider, email]);
    if (result.length > 0) {
      return result[0];
    }
    return false;
  } catch (err) {
    console.error(err);
    return true;
  }
}

async function insertNewUser(email, hashedPassword, username) {
  try {
    await pool.query('START TRANSACTION;');
    const [result] = await pool.query('INSERT INTO user(provider, email, password, username) VALUES (?,?,?,?)', [0, email, hashedPassword, username]);
    await pool.query('COMMIT');
    return result.insertId;
  } catch (err) {
    console.error(err);
    await pool.query('ROLLBACK');
    return false;
  }
}

module.exports = { checkEmailExist, insertNewUser, selectHashedPassword };
