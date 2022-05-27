const errorHandler = require('./errorHandler');
const pool = require('./rdb');

const wrapModel = async (fn, params = []) => {
    try {
        return await fn(...params);
    } catch (err) {
        throw new errorHandler(500, 5000, `Sql errno: ${err.errno}, message: ${err.sqlMessage}`);
    }
};

const wrapTransactionModel = async (fn, params = []) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION;');
        const result = await fn(conn, ...params);
        await conn.query('COMMIT');
        return result;
    } catch (err) {
        await conn.query('ROLLBACK');
        throw new errorHandler(500, 5000, `Sql errno: ${err.errno}, message: ${err.sqlMessage}`);
    } finally {
        await conn.release();
    }
};

const wrapTransactionLockModel = async (fn, tableName, params = []) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION;');
        await conn.query(`LOCK TABLES ${tableName} WRITE;`);
        const result = await fn(conn, ...params);
        await conn.query('COMMIT');
        return result;
    } catch (err) {
        await conn.query('ROLLBACK');
        throw new errorHandler(500, 5000, `Sql errno: ${err.errno}, message: ${err.sqlMessage}`);
    } finally {
        await conn.query('UNLOCK TABLES');
        await conn.release();
    }
};

module.exports = { wrapModel, wrapTransactionModel, wrapTransactionLockModel };
