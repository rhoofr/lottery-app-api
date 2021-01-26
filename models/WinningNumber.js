const mongoose = require('mongoose');

const WinningNumberSchema = new mongoose.Schema({
  game: {
    type: String,
    enum: ['P', 'M'],
    required: [true, 'Please add a game, either P or M'],
    maxlength: 1
  },
  first: {
    type: Number,
    required: [true, 'Please add a first number']
  },
  second: {
    type: Number,
    required: [true, 'Please add a second number']
  },
  third: {
    type: Number,
    required: [true, 'Please add a third number']
  },
  fourth: {
    type: Number,
    required: [true, 'Please add a fourth number']
  },
  fifth: {
    type: Number,
    required: [true, 'Please add a fifth number']
  },
  ball: {
    type: Number,
    required: [true, 'Please add a ball number']
  },
  drawDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WinningNumber', WinningNumberSchema);
