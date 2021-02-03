const { validationResult } = require('express-validator');
const asyncHandler = require('../middleware/async');
const PlayedNumber = require('../models/PlayedNumber');
const Result = require('../models/Result');
const HttpError = require('../models/http-error');
const {
  allNumbersValid,
  datesValidForGame,
  checkIdIsValid
} = require('../utils/validations');
const {
  numbersPlayedById,
  calcRemainingDrawings
} = require('../common/playedNumbers');
const {
  winningNumbersForGameAndDateRange,
  checkTicketAgainstWinningNumbers
} = require('../common/winningNumbers');

/**
 * @desc      Create NumbersPlayed
 * @route     POST /api/v1/lottery/numbersplayed
 * @access    Public
 * @return    {Object} with success and results
 */
exports.createNumbersPlayed = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  let playedNumbers;

  const {
    game,
    first,
    second,
    third,
    fourth,
    fifth,
    ball,
    startDate,
    endDate
  } = req.body;

  // Validate the numbers
  if (
    !allNumbersValid([
      Number(first),
      Number(second),
      Number(third),
      Number(fourth),
      Number(fifth)
    ])
  ) {
    console.log(
      'createNumbersPlayed error: Invalid set of numbers passed in.  Unable to create record.'
    );
    return res.status(400).json({
      success: false,
      message: 'Invalid set of numbers passed in.  Unable to create record.'
    });
  }
  // Validate the startDate and endDate
  if (!datesValidForGame(game, new Date(startDate), new Date(endDate))) {
    console.log(
      'createNumbersPlayed error: Invalid start date or end date passed in for the game.  Unable to create record.'
    );
    return res.status(400).json({
      success: false,
      message:
        'Invalid start date or end date passed in for the game.  Unable to create record.'
    });
  }

  try {
    playedNumbers = await PlayedNumber.create({
      game,
      first,
      second,
      third,
      fourth,
      fifth,
      ball,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
  } catch (error) {
    console.log(`createNumbersPlayed error: ${error}`);
    return res.status(500).json({
      success: false,
      message: error
    });
  }

  res.status(201).json({
    success: true,
    results: playedNumbers
  });
});

/**
 * @desc      Retrieve Numbers Played from the DB.
 * @route     GET /api/v1/lottery/numbersplayed
 * @access    Public
 * @return    {Object} success, count and results
 */
exports.retrieveNumbersPlayed = asyncHandler(async (req, res, next) => {
  let results;

  try {
    results = await PlayedNumber.find({}).sort({ endDate: -1 });
  } catch (error) {
    console.log(`retrieveNumbersPlayed error: ${error}`);
    return res.status(500).json({
      success: false,
      message: error
    });
  }

  return res.status(200).json({
    success: true,
    count: results.length,
    results
  });
});

/**
 * @desc      Retrieve specific Numbers Played by Id from the DB.
 * @route     GET /api/v1/lottery/numbersplayed/:id
 * @access    Public
 * @return    {Object} success and results
 */
exports.getNumbersPlayedById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!checkIdIsValid(id)) {
    return next(new HttpError('Invalid Id for Played Numbers', 400));
  }

  let playedNumbers;

  try {
    playedNumbers = await numbersPlayedById(id);
    if (Object.keys(playedNumbers).length > 0) {
      return res.status(200).json({
        success: true,
        playedNumbers
      });
    }
  } catch (error) {
    console.log(`getNumbersPlayedById error: ${error}`);
    return res.status(500).json({
      success: false,
      message: error
    });
  }

  return res.status(404).json({
    success: false,
    result: {}
  });
});

/**
 * @desc      Delete specific Numbers Played by Id from the DB.  Will also remove all related results.
 * @route     DELETE /api/v1/lottery/numbersplayed/:id
 * @access    Public
 * @return    {Object} success and message
 */
exports.deleteNumbersPlayedById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!checkIdIsValid(id)) {
    return next(new HttpError('Invalid Id for Played Numbers', 400));
  }

  // Remove the playedNumbers document and any related Results documents.
  // NOTE: Possible it could delete the playedNumbers and not the Results, but I will get notified.
  // Cannot use transaction because that requires a replica set which I could not get
  // to work on windows as a service...
  try {
    await PlayedNumber.findByIdAndRemove(id, (err, result) => {
      if (err) {
        console.log(`deleteNumbersPlayedById error" ${err}`);
        return res.status(500).json({
          success: false,
          message: `deleteNumbersPlayedById error" ${err}`
        });
      }
    });

    await Result.deleteMany({ numbersPlayedId: id }, (err, result) => {
      if (err) {
        console.log(`deleteNumbersPlayedById error" ${err}`);
        return res.status(500).json({
          success: false,
          message: `deleteNumbersPlayedById error deleting Results for played number: " ${err}. The played number has been deleted!!!`
        });
      }
    });
  } catch (error) {
    console.log(`deleteNumbersPlayedById error: ${error}`);
    return res.status(500).json({
      success: false,
      message: `deleteNumbersPlayedById error" ${error}`
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Deleted ticket.'
  });
});

/**
 * @desc      Update specific Numbers Played by Id from the DB.
 * @route     PATCH /api/v1/lottery/numbersplayed/:id
 * @access    Public
 * @return    {Object} success and results
 */
exports.updateNumbersPlayed = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const { id } = req.params;
  if (!checkIdIsValid(id)) {
    return next(new HttpError('Invalid Id for place', 400));
  }

  let playedNumber = await PlayedNumber.findById(id);
  if (!PlayedNumber) {
    return next(new HttpError(`No Played Numbers with the id of ${id}`, 404));
  }

  playedNumber = await PlayedNumber.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    results: playedNumber
  });
});

/**
 * @desc      Retrieve specific Numbers Played and Winning Numbers by Id from the DB.
 * @route     GET /api/v1/lottery/drawsforticket/:id
 * @access    Public
 * @return    {Object} success, length, results, remainingDraws
 */
exports.getDrawsForTicket = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!checkIdIsValid(id)) {
    return next(new HttpError('Invalid Id for Played Numbers', 400));
  }
  let playedNumbers;

  try {
    playedNumbers = await numbersPlayedById(id);
    if (Object.keys(playedNumbers).length > 0) {
      const winningNumbers = await winningNumbersForGameAndDateRange(
        playedNumbers.game,
        playedNumbers.startDate,
        playedNumbers.endDate
      );

      const results = await checkTicketAgainstWinningNumbers(
        playedNumbers,
        winningNumbers
      );

      const remaining = calcRemainingDrawings(
        playedNumbers.game,
        playedNumbers.endDate
      );

      return res.status(200).json({
        success: true,
        length: results.length,
        results,
        remaining
      });
    }
  } catch (error) {
    console.log(`getDrawsForTicket error: ${error}`);
    return res.status(500).json({
      success: false,
      message: error
    });
  }

  return res.status(404).json({
    success: false,
    result: {}
  });
});
