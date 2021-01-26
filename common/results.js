const Result = require('../models/Result');

exports.getResultsFromDb = async () => {
  try {
    const results = await Result.find({}).sort({ drawDate: -1 });

    return results;
  } catch (error) {
    console.log(`getResultsFromDb error: ${error}`);
    throw new Error(`getResultsFromDb error ${error}`);
  }
};
