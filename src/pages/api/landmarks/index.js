const {
  checkIsHeaderOk,
  isBodyValid,
  checkIsRequestDate,
  checkIsRequestNumber,
  filterLandmarksInBody,
  filterChannelsInRequest,
} = require('../../../libs/requestProcessing');
const {
  getLandmarkAll,
  getLandmarkByChannel,
  getLandmarkBeforeDate,
  getLandmarkAfterDate,
  postLandmarkUpdateOne,
} = require('../../../libs/landmarksDataProcessing');
const { dbConnect } = require('../../../util/mongodb');

dbConnect();

/**
 * Handle POST method
 * @param {*} req
 * @param {*} res
 * @returns JSON-object with status code
 */
const postLandmarks = async (req, res) => {
  const bodyCheck = isBodyValid(req.body);
  try {
    if (!bodyCheck.isValid) {
      return res.status(400).json({
        error: bodyCheck.message,
      });
    } else {
      const landmarks = filterLandmarksInBody(req.body);
      for (const lm of landmarks) {
        postLandmarkUpdateOne(lm);
      }
      return res.status(201).json();
    }
  } catch (err) {
    return res.status(400).json({
      error: err.message,
    });
  }
};

/**
 * Handle GET method
 * @param {*} req
 * @param {*} res
 * @returns JSON-object with status code
 */
const getLandmarks = async (req, res) => {
  try {
    let resultGetLandmarks = [];
    let msg = [];

    if (req.query.before) {
      if (checkIsRequestDate(req.query.before)) {
        resultGetLandmarks = await getLandmarkBeforeDate(req.query.before);
        if (resultGetLandmarks.length === 0) {
          msg.push({
            message: 'Nothing found before provided date',
          });
        }
      } else {
        msg.push({
          message: 'Wrong date',
        });
      }
    } else if (req.query.after) {
      if (checkIsRequestDate(req.query.after)) {
        resultGetLandmarks = await getLandmarkAfterDate(req.query.after);
        if (resultGetLandmarks.length === 0) {
          msg.push({
            message: 'Nothing found after provided date',
          });
        }
      }
    } else if (req.query.period) {
      if (checkIsRequestNumber(req.query.period)) {
        const startPeriod = new Date(
          (Math.floor(Date.now() / 1000) - req.query.period) * 1000
        );
        resultGetLandmarks = await getLandmarkAfterDate(startPeriod);
        if (resultGetLandmarks.length === 0) {
          msg.push({
            message: 'Nothing found during provided period',
          });
        }
      } else {
        msg.push({
          message: `Wrong quantity of seconds (not  number)`,
        });
      }
    } else if (req.query.channels) {
      const channels = filterChannelsInRequest(req.query.channels);
      let resChannels = [];
      for (let ch of channels) {
        resChannels = await getLandmarkByChannel(ch);
        resChannels.forEach((lm) => resultGetLandmarks.push(lm));
      }
      if (!resultGetLandmarks.length) {
        msg.push({
          message: 'Nothing found inside given channel(s)',
        });
      }
    } else {
      resultGetLandmarks = await getLandmarkAll();
      if (resultGetLandmarks.length === 0) {
        msg.push({
          message: 'Nothing found from the DB',
        });
      }
    }

    resultGetLandmarks.length > 0
      ? res.status(201).json({ landmarks: resultGetLandmarks })
      : res.json(msg);
  } catch (error) {
    return res.status(400).json({
      message: 'Invalid Request Method',
      error: error.message,
    });
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 */
const handler = async (req, res) => {
  const { method, headers } = req;

  try {
    let headerCheck = checkIsHeaderOk(headers);
    switch (method) {
      case 'GET':
        if (!headerCheck.isValid) {
          return res.status(400).json({
            error: headerCheck.message,
          });
        }
        await getLandmarks(req, res);
        break;
      case 'POST':
        if (!headerCheck.isValid) {
          return res.status(400).json({
            error: headerCheck.message,
          });
        }
        await postLandmarks(req, res);
        break;
      default:
        return res.status(400).json({
          data: 'No data fetched, check your request',
        });
    }
  } catch (err) {
    const error = `Error: Invalid Request Method. ${err}`;
    return res.status(400).json({
      error: error,
    });
  }
};

module.exports = handler;
