const { pool } = require('../../util/rdb_mysql');

async function checkDataExist(id, conn) {
  try {
    if (!conn) {
      conn = await pool.getConnection();
    }
    await conn.query('START TRANSACTION;');
    await conn.query('LOCK TABLES url WRITE;');

    const [result] = await conn.query('SELECT id FROM database WHERE id = ? FOR UPDATE;', [id]);
    if (result.length > 0) {
      return result;
    }

    return false;
  } catch (err) {
    console.error(err);
    await conn.query('ROLLBACK');
    return false;
  } finally {
    await conn.query('UNLOCK TABLES');
    await conn.release();
  }
}

module.exports = { checkDataExist };
