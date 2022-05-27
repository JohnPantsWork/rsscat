const { pool } = require('../util/rdb');

async function checkUserExistModel(provider, email) {
    const [result] = await pool.query('SELECT id FROM user WHERE provider = ? AND email = ?', [
        provider,
        email,
    ]);
    if (result.length > 0) {
        return result[0].id;
    }
    return false;
}

async function selectHashedPasswordModel(provider, email) {
    const [result] = await pool.query(
        'SELECT password,username,id FROM user WHERE provider = ? AND email = ?',
        [provider, email]
    );
    if (result.length > 0) {
        return result[0];
    }
    return false;
}

async function insertNewUserModel(email, hashedPassword, username) {
    const [result] = await pool.query(
        'INSERT INTO user(provider, email, password, username) VALUES (?,?,?,?)',
        [0, email, hashedPassword, username]
    );

    return result.insertId;
}

async function insertNewOauthUserModel(provider, email, username) {
    const [result] = await pool.query(
        'INSERT INTO user(provider, email, username) VALUES (?,?,?)',
        [provider, email, username]
    );
    return result.insertId;
}

async function selectUserDataModel(id) {
    const [result] = await pool.query(
        'SELECT email, username, signup_date, liked_counts, link_counts, cat_clicked, mission_completed FROM user WHERE id = ?',
        [id]
    );
    if (result.length === 0) {
        return false;
    }
    return result[0];
}

async function selectUserLoginDateModel(id) {
    const [result] = await pool.query('SELECT login_date FROM user WHERE id = ?', [id]);
    if (result.length === 0) {
        return false;
    }
    return result[0].login_date;
}

async function selectCoinsModel(id) {
    const [result] = await pool.query('SELECT coins FROM user WHERE id = ?', [id]);
    if (result.length === 0) {
        return false;
    }
    return result[0].coins;
}

async function updateCoinsModel(coins, id) {
    await pool.query('UPDATE user SET coins = coins + ? WHERE id = ?', [coins, id]);
    return true;
}

async function updateCatClickedModel(cat_clicked, id) {
    await pool.query('UPDATE user SET cat_clicked = cat_clicked + ? WHERE id = ?', [
        cat_clicked,
        id,
    ]);
    return true;
}

async function updateLikedCountModel(liked_counts, id) {
    await pool.query('UPDATE user SET liked_counts = liked_counts + ? WHERE id = ?', [
        liked_counts,
        id,
    ]);

    return true;
}

async function updateLinkCountsModel(link_counts, id) {
    await pool.query('UPDATE user SET link_counts = link_counts + ? WHERE id = ?', [
        link_counts,
        id,
    ]);

    return true;
}

async function updateMissionCompletedModel(mission_completed, id) {
    await pool.query('UPDATE user SET mission_completed = mission_completed + ? WHERE id = ?', [
        mission_completed,
        id,
    ]);

    return true;
}

async function updateLoginDateModel(id) {
    await pool.query('UPDATE user SET login_date = CURRENT_TIMESTAMP() WHERE id = ?', [id]);

    return true;
}

module.exports = {
    checkUserExistModel,
    insertNewUserModel,
    insertNewOauthUserModel,
    selectHashedPasswordModel,
    selectUserDataModel,
    selectUserLoginDateModel,
    selectCoinsModel,
    updateCoinsModel,
    updateCatClickedModel,
    updateLikedCountModel,
    updateLinkCountsModel,
    updateMissionCompletedModel,
    updateLoginDateModel,
};
