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
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION;');
    const [result] = await conn.query('INSERT INTO user(provider, email, password, username) VALUES (?,?,?,?)', [0, email, hashedPassword, username]);
    await conn.query('COMMIT');
    return result.insertId;
  } catch (err) {
    console.error(err);
    await conn.query('ROLLBACK');
    return false;
  } finally {
    await conn.query('UNLOCK TABLES');
    await conn.release();
  }
}

async function selectUserData(id) {
  try {
    const [result] = await pool.query('SELECT email, username, signup_date, liked_counts, link_counts, cat_clicked, mission_completed FROM user WHERE id = ?', [id]);
    if (result.length === 0) {
      return false;
    }
    return result[0];
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function selectUserLoginDate(id) {
  try {
    const [result] = await pool.query('SELECT login_date FROM user WHERE id = ?', [id]);
    if (result.length === 0) {
      return false;
    }
    return result[0].login_date;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function selectCoins(id) {
  try {
    const [result] = await pool.query('SELECT coins FROM user WHERE id = ?', [id]);
    if (result.length === 0) {
      return false;
    }
    return result[0].coins;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function updateCoins(coins, id) {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION;');
    const [result] = await conn.query('UPDATE user SET coins = coins + ? WHERE id = ?', [coins, id]);
    console.log(`#result#`, result);
    await conn.query('COMMIT');
    return true;
  } catch (err) {
    console.error(err);
    await conn.query('ROLLBACK');
    return false;
  } finally {
    await conn.query('UNLOCK TABLES');
    await conn.release();
  }
}

async function updateCatClicked(cat_clicked, id) {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION;');
    const [result] = await conn.query('UPDATE user SET cat_clicked = cat_clicked + ? WHERE id = ?', [cat_clicked, id]);
    console.log(`#result#`, result);
    await conn.query('COMMIT');
    return true;
  } catch (err) {
    console.error(err);
    await conn.query('ROLLBACK');
    return false;
  } finally {
    await conn.query('UNLOCK TABLES');
    await conn.release();
  }
}

async function updateLikedCount(liked_counts, id) {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION;');
    const [result] = await conn.query('UPDATE user SET liked_counts = liked_counts + ? WHERE id = ?', [liked_counts, id]);
    console.log(`#result#`, result);
    await conn.query('COMMIT');
    return true;
  } catch (err) {
    console.error(err);
    await conn.query('ROLLBACK');
    return false;
  } finally {
    await conn.query('UNLOCK TABLES');
    await conn.release();
  }
}

async function updateLinkCounts(link_counts, id) {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION;');
    const [result] = await conn.query('UPDATE user SET link_counts = link_counts + ? WHERE id = ?', [link_counts, id]);
    console.log(`#result#`, result);
    await conn.query('COMMIT');
    return true;
  } catch (err) {
    console.error(err);
    await conn.query('ROLLBACK');
    return false;
  } finally {
    await conn.query('UNLOCK TABLES');
    await conn.release();
  }
}

async function updateMissionCompleted(mission_completed, id) {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION;');
    const [result] = await conn.query('UPDATE user SET mission_completed = mission_completed + ? WHERE id = ?', [mission_completed, id]);
    console.log(`#result#`, result);
    await conn.query('COMMIT');
    return true;
  } catch (err) {
    console.error(err);
    await conn.query('ROLLBACK');
    return false;
  } finally {
    await conn.query('UNLOCK TABLES');
    await conn.release();
  }
}

module.exports = {
  checkEmailExist,
  insertNewUser,
  selectHashedPassword,
  selectUserData,
  selectUserLoginDate,
  selectCoins,
  updateCoins,
  updateCatClicked,
  updateLikedCount,
  updateLinkCounts,
  updateMissionCompleted,
};
