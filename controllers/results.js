/* eslint-disable object-curly-newline */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const asyncHandler = require('../middleware/async');

const {
  getWinningNumbers,
  calculateMegaWinnings,
  calculatePBWinnings
} = require('../common/winningNumbers');
const { checkTimeForNewticket } = require('../common/playedNumbers');
const {
  upcomingRefreshRequired,
  refreshUpcoming
} = require('../common/upcoming');
const { getResultsFromDb } = require('../common/results');
const { getDifferenceInDays } = require('../utils/datetime');
const PlayedNumber = require('../models/PlayedNumber');
const Result = require('../models/Result');

/**
 * @desc      Check if the date passed for the game is a draw day.
 * @param     {string} game - Which game to check P or M.
 * @param     {string} dateToCheck - The date to get the winning numbers for.
 * @return    {Boolean} True/False.
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
 * @desc      Check all results for open tickets for PB and Mega
 * @route     Get /api/v1/lottery/checkresults
 * @access    Public
 * @return    {Object} success, count, results
 */
exports.checkResults = asyncHandler(async (req, res, next) => {
  const dtNowMinusOne = new Date();
  dtNowMinusOne.setHours(0, 0, 0, 0);
  dtNowMinusOne.setDate(dtNowMinusOne.getDate() - 1);
  // console.log(dtNowMinusOne);
  let dtToCheck;
  let daysDifference = 0;
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

    daysDifference = getDifferenceInDays(startDate, endDate);

    const results = await Result.find({
      game: game,
      numbersPlayedId: numbersPlayedId
    }).exec();

    for (let i = 0; i <= daysDifference; i++) {
      if (checkIsDrawDate(game, dtToCheck)) {
        let found = false;

        // eslint-disable-next-line no-restricted-syntax
        for (const result of results) {
          if (result.drawDate.valueOf() === dtToCheck.valueOf()) {
            found = true;
            break;
          }
        }

        if (!found) {
          // checkedResults.push({ game, date: dtToCheck });
          const resultFromApi = await getWinningNumbers(dtToCheck, game);

          // if we are at the last record then all results are checked.
          if (
            i === daysDifference ||
            dtToCheck.valueOf() === endDate.valueOf()
          ) {
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
 * @return    success, count results, newTicketRequired
 */
exports.getResults = asyncHandler(async (req, res, next) => {
  try {
    // Need to keep upcomingDrawings refreshed so our api key does not get locked.
    if (await upcomingRefreshRequired()) {
      try {
        await refreshUpcoming();
      } catch (error) {
        console.error(
          'Got error in getResults calling refreshUpcoming. Continuing...'
        );
      }
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
