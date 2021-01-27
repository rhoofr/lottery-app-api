/* eslint-disable object-curly-newline */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
// const { default: axios } = require('axios');
const asyncHandler = require('../middleware/async');

const {
  getWinningNumbers,
  calculateMegaWinnings,
  calculatePBWinnings,
  winningNumbersForGameAndDateRange,
  checkTicketAgainstWinningNumbers
} = require('../common/winningNumbers');
const {
  upcomingRefreshRequired,
  refreshUpcoming
} = require('../common/upcoming');
const {
  checkTimeForNewticket,
  numbersPlayedById
} = require('../common/playedNumbers');
const { getResultsFromDb } = require('../common/results');
const { getDifferenceInDays } = require('../utils/datetime');
const { allNumbersValid, datesValidForGame } = require('../utils/validations');
const PlayedNumber = require('../models/PlayedNumber');
const WinningNumbers = require('../models/WinningNumber');
const UpcomingDrawing = require('../models/UpcomingDrawing');
const Result = require('../models/Result');

/**
 * @desc      Check if the date passed for the game is a draw day.
 * @param {string} game - Which game to check P or M.
 * @param {string} dateToCheck - The date to get the winning numbers for.
 * @return {Boolean} True/False.
 */
const checkIsDrawDate = (game, dateToCheck) => {
  const day = dateToCheck.getDay();
  // Sunday - Saturday : 0 - 6
  // sunday 0, Monday 1, Tuesday 2, Wednesday 3, Thursday 4, Friday 5, Saturday 6
  if (game === 'P') {
    if (day === 3 || day === 6) return true;
    return false;
  }
  if (day === 2 || day === 5) return true;
  return false;
};

/**
 * @desc      Create NumbersPlayed
 * @route     POST /api/v1/lottery/numbersplayed
 * @access    Public
 */
exports.createNumbersPlayed = asyncHandler(async (req, res, next) => {
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

  // game = game.toUpperCase(); // Want uppercase P or M

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
 */
exports.getNumbersPlayedById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
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
 * @desc      Retrieve specific Numbers Played and Winning Numbers by Id from the DB.
 * @route     GET /api/v1/lottery/drawsforticket/:id
 * @access    Public
 */
exports.getDrawsForTicket = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
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

      return res.status(200).json({
        success: true,
        length: results.length,
        results
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

/**
 * @desc      Retrieve Winning Numbers from the DB.
 * @route     GET /api/v1/lottery/winningnumbers
 * @access    Public
 */
exports.retrieveWinningNumbers = asyncHandler(async (req, res, next) => {
  let results;

  try {
    results = await WinningNumbers.find({}).sort({ drawDate: -1 });
  } catch (error) {
    console.log(`retrieveWinningNumbers error: ${error}`);
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
 * @desc      Fetch upcoming drawing amounts for PB and Mega
 * @route     Get /api/v1/lottery/checkupcoming
 * @access    Public
 */
exports.checkUpcoming = asyncHandler(async (req, res, next) => {
  // let URI;
  // let pbResults;
  // let megaResults;
  let refreshResults = {};
  let nextDDPb;
  let nextDDMega;
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  let needPb = false;
  let needMega = false;
  let pbReturn = {};
  let megaReturn = {};

  try {
    nextDDPb = await UpcomingDrawing.find(
      { game: 'P' },
      { _id: 0, game: 1, nextDrawDate: 1, currentJackpot: 1 }
    )
      .sort({ nextDrawDate: -1 })
      .limit(1);

    if (
      !nextDDPb[0].nextDrawDate ||
      nextDDPb[0].nextDrawDate.valueOf() < date.valueOf()
    ) {
      needPb = true;
    }

    nextDDMega = await UpcomingDrawing.find(
      { game: 'M' },
      { _id: 0, game: 1, nextDrawDate: 1, currentJackpot: 1 }
    )
      .sort({ nextDrawDate: -1 })
      .limit(1);

    if (
      !nextDDMega[0].nextDrawDate ||
      nextDDMega[0].nextDrawDate.valueOf() < date.valueOf()
    ) {
      needMega = true;
    }

    // Call refresh method passing needPb and needMega
    refreshResults = await refreshUpcoming(false, false); // NOTE: ** FALSE ** for testing, should be (needPb, needMega);
    // console.log(refreshResults);
  } catch (error) {
    console.log(`checkUpcoming error: ${error}`);
    return res.status(500).json({
      success: false,
      message: error
    });
  }

  if (!needPb) {
    // From DB
    pbReturn._id = nextDDPb[0]._doc._id;
    pbReturn.game = 'P';
    pbReturn.currentJackpot = nextDDPb[0]._doc.currentJackpot;
    pbReturn.nextDrawDate = nextDDPb[0]._doc.nextDrawDate;
  } else {
    // From API call
    pbReturn = { ...refreshResults[0] };
  }

  if (!needMega) {
    // From DB
    megaReturn._id = nextDDMega[0]._doc._id;
    megaReturn.game = 'M';
    megaReturn.currentJackpot = nextDDMega[0]._doc.currentJackpot;
    megaReturn.nextDrawDate = nextDDMega[0]._doc.nextDrawDate;
  } else {
    // From API call
    megaReturn = { ...refreshResults[1] };
  }

  return res.status(200).json({
    success: true,
    // results: refreshResults,
    pbResult: pbReturn,
    megaResult: megaReturn
    // pbResults: pbResults.data,
    // megaResults: megaResults.data
  });
});

/**
 * @desc      Check all results for open tickets for PB and Mega
 * @route     Get /api/v1/lottery/checkresults
 * @access    Public
 */
exports.checkResults = asyncHandler(async (req, res, next) => {
  const dtNowMinusOne = new Date();
  dtNowMinusOne.setHours(0, 0, 0, 0);
  dtNowMinusOne.setDate(dtNowMinusOne.getDate() - 1);
  // console.log(dtNowMinusOne);
  let dtToCheck;
  let daysDiffence = 0;
  let numbersPlayedId;

  const numbersPlayedToCheck = await PlayedNumber.aggregate([
    { $match: { allResultsChecked: false } },
    { $sort: { endDate: 1 } }
  ]);

  for (const item of numbersPlayedToCheck) {
    numbersPlayedId = item._id;
    const { game, startDate, endDate } = item;
    dtToCheck = startDate;
    if (dtToCheck > dtNowMinusOne) break;

    daysDiffence = getDifferenceInDays(startDate, endDate);

    const results = await Result.find({
      game: game,
      numbersPlayedId: numbersPlayedId
    }).exec();

    for (let i = 0; i <= daysDiffence; i++) {
      if (checkIsDrawDate(game, dtToCheck)) {
        let found = false;

        // eslint-disable-next-line no-restricted-syntax
        for (const result of results) {
          if (result.drawDate.valueOf() === dtToCheck.valueOf()) {
            console.log(
              'checkResults - found=true. Already have results for this date.'
            );
            found = true;
            break;
          }
        }

        if (!found) {
          // checkedResults.push({ game, date: dtToCheck });
          const resultFromApi = await getWinningNumbers(dtToCheck, game);

          // if we are at the last record then all results are checked.
          if (i === daysDiffence) {
            await PlayedNumber.findByIdAndUpdate(item._id, {
              allResultsChecked: true
            });
          }

          if (game === 'M') {
            await calculateMegaWinnings(item, resultFromApi);
          } else if (game === 'P') {
            await calculatePBWinnings(item, resultFromApi);
          }
        }
      }

      dtToCheck.setDate(dtToCheck.getDate() + 1);
      if (dtToCheck > endDate || dtToCheck > dtNowMinusOne) break;
    }
  }

  // Now get all the results and return them
  try {
    const results = await getResultsFromDb();

    return res.status(200).json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    console.log(`getResults error: ${error}`);
    return res.status(500).json({
      success: false,
      message: error
    });
  }
});

/**
 * @desc      Retrieve all results.
 * @route     Get /api/v1/lottery/results
 * @access    Public
 */
exports.getResults = asyncHandler(async (req, res, next) => {
  try {
    // Need to keep upcomingDrawings refreshed so our api key does not get locked.
    if (await upcomingRefreshRequired()) {
      await refreshUpcoming();
    }

    // Check if new ticket is required
    const newTicketRequired = await checkTimeForNewticket();

    const results = await getResultsFromDb();

    return res.status(200).json({
      success: true,
      count: results.length,
      results,
      newTicketRequired
    });
  } catch (error) {
    console.log(`getResults error: ${error}`);
    return res.status(500).json({
      success: false,
      message: error
    });
  }
});
