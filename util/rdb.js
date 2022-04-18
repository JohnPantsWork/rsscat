require('dotenv').config();
const { RDB_HOST, RDB_USER, RDB_PASSWORD, RDB_DATABASE } = process.env;
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: RDB_HOST,
  user: RDB_USER,
  password: RDB_PASSWORD,
  database: RDB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = { pool };
// module.exports = [pool0, pool1]; //當想要多個資料庫輪流使用，可以輸出陣列。
// module.exports = [[pool0], [pool1, pool2]]; //更進一步區分讀寫資料庫時。
