const errRes = (status, message) => {
    const error = new Error();
    error.status = status;
    error.message = message;
    return error;
};

const wrapAsync = (fn) => {
    return function (req, res, next) {
        fn(req, res, next).catch((err) => {
            console.error(err);
            next(err);
        });
    };
};

const todayDate = () => {
    const now = new Date();
    const date = `${now.getFullYear()}-${now.getMonth()}-${now.getDay()}`;
    return date;
};

const objKeyArray = (obj) => {
    let keys = [];
    Object.keys(obj).forEach((k) => {
        keys.push(k);
    });
    return keys;
};

const objValueArray = (obj) => {
    let values = [];
    Object.values(obj).forEach((v) => {
        values.push(v);
    });
    return values;
};

const asyncLoopObj = async (obj, fn) => {
    const keys = objKeyArray(obj);
    for (let i = 0; i < keys.length; i += 1) {
        await fn(keys[i], obj[keys[i]]);
    }
    return;
};

const topValues = (obj, amount, page = 0) => {
    const start = page * amount;
    const end = start + amount;
    const result = Object.entries(obj)
        .sort((a, b) => {
            return b[1] - a[1];
        })
        .slice(start, end);
    return result;
};

const topKeys = (obj, amount, page = 0) => {
    const start = page * amount;
    const end = start + amount;
    const result = Object.entries(obj)
        .sort((a, b) => {
            return b[0] - a[0];
        })
        .slice(start, end);

    return result;
};

const arrayObjValue = (array) => {
    const result = array.map((e) => {
        const value = Object.values(e)[0];
        return value;
    });
    return result;
};

const getNow = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const hour = now.getHours();
    const min = now.getMinutes();
    const sec = now.getSeconds();
    const milliseconds = now.getTime();
    const day = now.getDay();
    return {
        date: `${year}-${month}-${date}`,
        time: `${hour}:${min}:${sec}`,
        milsec: milliseconds,
        day: day,
    };
};

// str='2022-03-21 17:20:32'
const stringDateConverter = (str) => {
    const dateArr = str.replaceAll('-', ' ').split(' ');
    const formatedDate = new Date(`${dateArr[0]},${dateArr[1]},${dateArr[2]},${dateArr[3]}`);
    return formatedDate;
};

const rssDateFormatter = (rssDate) => {
    const dateArr = rssDate.replace(',', '').split(' ');
    const year = dateArr[3];
    const month = dateArr[2];
    const date = dateArr[1];
    const time = dateArr[4];
    const formatedDate = new Date(`${year},${month},${date},${time}`);
    return formatedDate;
};

const shuffle = (array) => {
    let currentIndex = array.length,
        randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

console.log(`##`, todayDate());

module.exports = {
    errRes,
    wrapAsync,
    todayDate,
    objKeyArray,
    objValueArray,
    asyncLoopObj,
    topValues,
    topKeys,
    arrayObjValue,
    getNow,
    stringDateConverter,
    rssDateFormatter,
    shuffle,
};
