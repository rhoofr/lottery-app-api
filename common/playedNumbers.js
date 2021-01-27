const PlayedNumber = require('../models/PlayedNumber');

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
 * @param {String} id - The date to get the winning numbers for.
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
