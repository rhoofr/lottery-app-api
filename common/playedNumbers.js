const PlayedNumber = require('../models/PlayedNumber');

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
