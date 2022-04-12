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

module.exports = { errRes, wrapAsync };
