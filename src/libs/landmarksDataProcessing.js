const Landmark = require('../models/Landmark');

/**
 *
 * @param {String} data
 * @returns Mongoose query
 * then to be executed by async/await interface
 */
const getLandmarkAll = async () => {
  try {
    return await Landmark.find().select('id -_id');
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

/**
 *
 * @returns Mongoose query with all the documents
 * then to be executed by async/await interface
 */
const getLandmarkById = async (data) => {
  try {
    return await Landmark.find({ id: data }).select('-_id -__v');
  } catch (error) {
    console.log(error.message);
    return {};
  }
};

const getLandmarkByChannel = async (data) => {
  try {
    return await Landmark.find({ channel: data }).select('id -_id');
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

const getLandmarkBeforeDate = async (data) => {
  try {
    return await Landmark.find({ timestamp: { $lte: data } }).select('id -_id');
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

const getLandmarkAfterDate = async (data) => {
  try {
    return await Landmark.find({ timestamp: { $gte: data } }).select('id -_id');
  } catch (error) {
    console.log(error.message);
    return [];
  }
};

const postLandmarkUpdateOne = async (data) => {
  let response;
  try {
    response = await Landmark.updateOne(
      { id: data.id },
      { ...data },
      { upsert: true }
    );
  } catch (error) {
    return 0;
  }
  return response.ok;
};

module.exports = {
  getLandmarkAll,
  getLandmarkById,
  getLandmarkByChannel,
  getLandmarkBeforeDate,
  getLandmarkAfterDate,
  postLandmarkUpdateOne,
};
