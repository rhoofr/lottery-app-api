const mongoose = require('mongoose');

const UpcomingDrawingSchema = new mongoose.Schema({
  game: {
    type: String,
    enum: ['P', 'M'],
    required: [true, 'Please add a game, either P or M'],
    maxlength: 1
  },
  currentJackpot: {
    type: Number
  },
  nextDrawDate: {
    type: Date,
    required: [true, 'Please add a next draw date']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UpcomingDrawing', UpcomingDrawingSchema);
