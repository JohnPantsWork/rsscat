// npm
const Joi = require('joi');
const errorHandler = require('./errorHandler');

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
            throw new errorHandler(400, 4102);
        }
        if (errMessage.includes('password')) {
            throw new errorHandler(400, 4103);
        }
        if (errMessage.includes('username')) {
            throw new errorHandler(400, 4104);
        }
    }
}

module.exports = userValidater;
