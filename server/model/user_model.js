// 這邊的示範是一個model，包含transaction結構、鎖表結構、鎖列結構。
// 其中conn可以來自外面呼叫model的獨立線路，也可以來自預設。

const pool = require('../../util/rdb');

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
    } // 若有值則回傳值。

    return false; // 若有無值則回傳false。
  } catch (err) {
    console.error(err);
    await conn.query('ROLLBACK'); // 產生錯誤則回滾。
    return false;
  } finally {
    await conn.query('UNLOCK TABLES'); // 解鎖表格。
    await conn.release(); // 釋放連線，是個可選項目。
  }
}

module.exports = { checkDataExist };
