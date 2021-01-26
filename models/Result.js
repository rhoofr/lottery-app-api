const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  game: {
    type: String
  },
  currentWinnings: {
    type: Number
  },
  numbersMatched: {
    type: Number
  },
  ballMatched: {
    type: Boolean
  },
  timeForNewTicket: {
    type: Boolean,
    default: false
  },
  drawDate: {
    type: Date
  },
  numbersPlayedId: {
    type: mongoose.Schema.ObjectId,
    ref: 'PlayedNumber',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Result', ResultSchema);
