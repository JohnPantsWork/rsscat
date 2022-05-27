const wrapAsync = (fn) => {
    return function (req, res, next) {
        fn(req, res, next).catch((err) => {
            next(err);
        });
    };
};

const objKeyArray = (obj) => {
    return Object.keys(obj);
};

const objValueArray = (obj) => {
    return Object.values(obj);
};

const asyncLoopObj = async (obj, fn) => {
    const keys = objKeyArray(obj);
    for (let i = 0; i < keys.length; i += 1) {
        await fn(keys[i], obj[keys[i]]);
    }
    return;
};

const arrayObjValue = (array) => {
    const result = array.map((e) => {
        const value = Object.values(e)[0];
        return value;
    });
    return result;
};

const todayDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
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

// input:'2022-03-21 17:20:32', output:js date data form.
const strToJsDateCvt = (str) => {
    const dateArr = str.replaceAll('-', ' ').split(' ');
    const formatedDate = new Date(`${dateArr[0]},${dateArr[1]},${dateArr[2]},${dateArr[3]}`);
    return formatedDate;
};

const rssToJsDateCvt = (rssDate) => {
    const dateArr = rssDate.replace(',', '').split(' ');
    const year = dateArr[3];
    const month = dateArr[2];
    const date = dateArr[1];
    const time = dateArr[4];
    const formatedDate = new Date(`${year},${month},${date},${time}`);
    return formatedDate;
};

const arrayShuffle = (array) => {
    let currentIndex = array.length,
        randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

module.exports = {
    wrapAsync,
    todayDate,
    objKeyArray,
    objValueArray,
    asyncLoopObj,
    arrayObjValue,
    getNow,
    strToJsDateCvt,
    rssToJsDateCvt,
    arrayShuffle,
    topValues,
};
