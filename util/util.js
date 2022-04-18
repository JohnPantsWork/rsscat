const errRes = (status, message) => {
  const error = new Error(message);
  error.status = status;
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

module.exports = { errRes, wrapAsync, todayDate, objKeyArray, objValueArray, asyncLoopObj, topValues, topKeys, arrayObjValue };
