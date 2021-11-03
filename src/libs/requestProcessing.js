const checkIsHeaderOk = (headers) => {
  let res = { isValid: false, message: '' };
  if (headers['content-type'] === 'application/json') {
    res.isValid = true;
    return res;
  }
  res.message = `Header must be set to 'content-type':'application/json'`;

  return res;
};

const isBodyValid = (body) => {
  let res = { isValid: checkIsPostBody(body), message: '' };

  if (!res.isValid) {
    res.message = 'Empty body';
    return res;
  }
  if (typeof body.landmarks === 'undefined' || body.landmarks.length === 0) {
    res.isValid = false;
    res.message = 'Empty landmarks: at least one landmark expected';
    return res;
  }
  if (!filterLandmarksInBody(body).length) {
    res.isValid = false;
    res.message = 'Individual landmark(s) entry(es) not valid';
  }
  return res;
};

const checkIsPostBody = (body) => {
  for (let key in body) {
    return true;
  }
  return false;
};

/**
 *
 * @param {req.body} requestBody
 * @returns filtered array with channels' names
 * or just empty array if req.body is empty
 */
const filterLandmarksInBody = (requestBody = []) =>
  requestBody.landmarks.filter((lm) => typeof lm.id !== 'undefined');

const checkIsRequestDate = (data) => !Number.isNaN(Date.parse(data));

const checkIsRequestNumber = (seconds) => !Number.isNaN(seconds);

const filterChannelsInRequest = (request = []) => request.split(',');

module.exports = {
  checkIsHeaderOk,
  isBodyValid,
  checkIsRequestDate,
  filterLandmarksInBody,
  filterChannelsInRequest,
  checkIsRequestNumber,
};
