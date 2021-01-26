const mongoose = require('mongoose');

const regNumValidator = function (val) {
  let regEx;
  if (this.game === 'P') {
    regEx = /\b(0?[1-9]|[1-6][0-9])\b/; // 1 - 69
  } else {
    regEx = /\b(0?[1-9]|[1-6][0-9]|70)\b/; // 1 - 70
    // eslint-disable-next-line max-len
    // regEx = /\b(0?[1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-5])\b/; // 1 - 75 ** temp made 75 because of mega change in 2017
  }
  if (regEx.test(val)) return true;
  return false;
};

const ballNumValidator = function (val) {
  let regEx;
  // console.log(`ballNumValidator`, 'game', this.game, `val`, val);
  if (this.game === 'P') {
    regEx = /\b(0?[1-9]|1[0-9]|2[0-6])\b/; // 1 - 26
  } else {
    regEx = /\b(0?[1-9]|1[0-9]|2[0-5])\b/; // 1 - 25
  }
  if (regEx.test(val)) return true;
  return false;
};

const PlayedNumberSchema = new mongoose.Schema({
  game: {
    type: String,
    enum: ['P', 'M'],
    required: [true, 'Please add a game, either P or M'],
    maxlength: 1
  },
  first: {
    type: Number,
    required: [true, 'Please add a first number'],
    validate: regNumValidator
  },
  second: {
    type: Number,
    required: [true, 'Please add a second number'],
    validate: regNumValidator
  },
  third: {
    type: Number,
    required: [true, 'Please add a third number'],
    validate: regNumValidator
  },
  fourth: {
    type: Number,
    required: [true, 'Please add a fourth number'],
    validate: regNumValidator
  },
  fifth: {
    type: Number,
    required: [true, 'Please add a fifth number'],
    validate: regNumValidator
  },
  ball: {
    type: Number,
    required: [true, 'Please add a ball number'],
    validate: ballNumValidator
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  allResultsChecked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PlayedNumber', PlayedNumberSchema);
