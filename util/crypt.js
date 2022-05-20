const argon2 = require('argon2');

const crypt = {
    hash: async (password) => {
        return await argon2.hash(password);
    },

    verify: async (hash, password) => {
        return await argon2.verify(hash, password);
    },
};

module.exports = { crypt };
