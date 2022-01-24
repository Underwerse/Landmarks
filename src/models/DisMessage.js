const mongoose = require('mongoose');

const DisMessageSchema = new mongoose.Schema(
  {
    entityID: {
      site: {
        type: Number,
        required: true,
        unique: true,
      },
      application: {
        type: Number,
        required: true,
        unique: false,
      },
      entity: {
        type: Number,
        required: true,
        unique: false,
      },
    },
    marking: {
      type: String,
      required: true,
      unique: false,
    },
    location: {
      x: {
        type: Number,
        required: true,
        unique: false,
      },
      y: {
        type: Number,
        required: true,
        unique: false,
      },
      z: {
        type: Number,
        required: true,
        unique: false,
      },
    },
  },
  { timestamps: true }
);

const DisMessage =
  mongoose.models.DisMessage || mongoose.model('DisMessage', DisMessageSchema);

module.exports = DisMessage;
