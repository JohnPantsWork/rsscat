// npm
const Joi = require('joi');
const { newErrRes } = require('./util');

// internal functions

const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),

    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'tw'] } })
        .max(30)
        .required(),
});

async function userValidater(username, email, password) {
    try {
        await schema.validateAsync({ username, email, password });
        return true;
    } catch (err) {
        const errMessage = err.details[0].message;
        if (errMessage.includes('email')) {
            throw newErrRes(400, { statusCode: 40002, msg: errMessage });
        }
        if (errMessage.includes('password')) {
            throw newErrRes(400, { statusCode: 40003, msg: errMessage });
        }
        if (errMessage.includes('username')) {
            throw newErrRes(400, { statusCode: 40004, msg: errMessage });
        }
    }
}

module.exports = { userValidater };
