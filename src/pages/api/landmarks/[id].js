const { dbConnect } = require('../../../util/mongodb');
const { getLandmarkById } = require('../../../libs/landmarksDataProcessing');
const { checkIsHeaderOk } = require('../../../libs/requestProcessing');

dbConnect();

export default async (req, res) => {
  const { headers } = req;
  const { id } = req.query;

  try {
    const headerCheck = checkIsHeaderOk(headers);
    if (!headerCheck.isValid) {
      return res.status(400).json({ error: headerCheck.message });
    }

    const lm = await getLandmarkById(id);

    !lm ? res.status(400).json({}) : res.status(200).json(lm);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
