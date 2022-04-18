// 這邊的示範是一個model，包含transaction結構、鎖表結構、鎖列結構。
// 其中conn可以來自外面呼叫model的獨立線路，也可以來自預設。

const pool = require('../../util/rdb');
const { todayDate } = require('../../util/util');

// timeRange=1 7 or 30, int number
async function getHotTags(timeRange) {
  try {
    const [result] = await pool.query(
      'SELECT * FROM tag_data where date(latest_date) = CURDATE() - interval ? day GROUP BY tag_id',
      [timeRange]
    );
    return result;
  } catch (err) {
    console.error(err);
    return false;
  }
}

module.exports = { getHotTags };
