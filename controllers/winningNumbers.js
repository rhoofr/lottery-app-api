const asyncHandler = require('../middleware/async');
const WinningNumbers = require('../models/WinningNumber');

/**
 * @desc      Retrieve Winning Numbers from the DB.
 * @route     GET /api/v1/lottery/winningnumbers
 * @access    Public
 * @return    {Object} success, count, results
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
