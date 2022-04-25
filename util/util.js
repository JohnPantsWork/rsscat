const errRes = (status, message) => {
  const error = new Error();
  error.status = status;
  error.message = message;
  return error;
};

const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => {
      console.log(err);
      next(err);
    });
  };
};

const todayDate = () => {
  const now = new Date();
  return `${now.getFullYear}-${now.getMonth}-${now.getDay}`;
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

const arrayDiff = (array1, array2) => {
  const result = array1.filter((e) => {
    return array2.indexOf(e) === -1;
  });
  return result;
};

const arraySame = (array1, array2) => {
  const result = array1.filter((e) => {
    return array2.indexOf(e) !== -1;
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
  result = { date: `${year}-${month}-${date}`, time: `${hour}:${min}:${sec}`, milsec: milliseconds, day: day };
  // result = new Date( new Date().setFullYear(new Date().getFullYear() ));
  return result;
};

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
  arrayDiff,
  arraySame,
  getNow,
};
