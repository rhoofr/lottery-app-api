const PlayedNumber = require('../models/PlayedNumber');
const { getDifferenceInDays } = require('../utils/datetime');

/**
 * @desc  Checks to see if all results have been checked in playednumbers and a new ticket is required.
 * @return {Boolean} True/False
 */
exports.checkTimeForNewticket = async () => {
  try {
    const allResultsChecked = await PlayedNumber.find({
      allResultsChecked: false
    }).countDocuments();

    return allResultsChecked === 0;
  } catch (error) {
    console.log(`checkTimeForNewticket error: ${error}`);
    throw new Error(`checkTimeForNewticket error ${error}`);
  }
};

/**
 * @desc  Retrieves the playednumbers for a given id.
 * @param {string} id - The date to get the winning numbers for.
 * @return {Object} A result object with all the data from the played number.
 */
exports.numbersPlayedById = async (id) => {
  try {
    const result = await PlayedNumber.find(
      { _id: id },
      {
        allResultsChecked: 0,
        createdAt: 0,
        __v: 0
      }
    );
    if (result.length > 0) {
      return result[0];
    }
  } catch (error) {
    console.log(`getNumbersPlayedById error: ${error}`);
    throw new Error(error);
  }

  return {};
};

/**
 * @desc  Retrieves the number of remaining drawings for the game
 * @param {string} game - The game to check.
 * @param {date} endDate - The end date of the game to check.
 * @return {Number} The amount of drawings left.
 */
exports.calcRemainingDrawings = (game, endDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dtToCheck = today;
  let remaining = 0;
  const daysDifference = getDifferenceInDays(today, endDate);

  if (daysDifference <= 0) return 0;

  // Sunday - Saturday : 0 - 6
  // Sunday = 0
  // Monday = 1
  // Tuesday = 2
  // Wednesday = 3
  // Thursday = 4
  // Friday = 5
  // Saturday = 6

  for (let i = 1; i <= daysDifference; i++) {
    switch (game) {
      case 'P':
        if (dtToCheck.getDay() === 3 || dtToCheck.getDay() === 6) remaining++;
        break;

      case 'M':
        if (dtToCheck.getDay() === 2 || dtToCheck.getDay() === 5) remaining++;
        break;
      default:
        break;
    }
    dtToCheck.setDate(dtToCheck.getDate() + 1);
  }

  return remaining;
};
