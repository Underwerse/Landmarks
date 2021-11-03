const mongoose = require('mongoose');

const LandmarkSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: String,
      required: true,
      unique: false,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    channel: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    fingerprint: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

/* LandmarkSchema.method('transform', function () {
  var obj = this.toObject();

  obj.id_mongo = obj._id;
  delete obj._id;

  return obj;
}); */

const Landmark =
  mongoose.models.Landmark || mongoose.model('Landmark', LandmarkSchema);

module.exports = Landmark;
