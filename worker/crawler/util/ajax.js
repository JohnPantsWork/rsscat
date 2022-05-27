const axios = require('axios');

const ajax = {
    params: async (params) => {
        return await axios(params);
    },
};

module.exports = ajax;
