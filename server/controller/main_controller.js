require('dotenv').config();
const { checkAndSave } = require('../model/shortRand_model');

const { SHORT_RAND_ENDPOINT } = process.env;

const postData = async (req, res) => {
  return res.status(200).json({ data: 'post success' });
};

const getData = async (req, res) => {
  const fakeData = { a: 1 };
  return res.status(200).json({ data: fakeData });
};

const deleteData = async (req, res) => {
  return res.status(200).json({ data: 'delete uccess' });
};

module.exports = {
  postData,
  getData,
  deleteData,
};
