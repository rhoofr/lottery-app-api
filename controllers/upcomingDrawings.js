const asyncHandler = require('../middleware/async');
const UpcomingDrawing = require('../models/UpcomingDrawing');
const { refreshUpcoming } = require('../common/upcoming');

/**
 * @desc      Fetch upcoming drawing amounts for PB and Mega
 * @route     Get /api/v1/lottery/checkupcoming
 * @access    Public
 * @return    {Object} success, pbResult, megaResult
 */
exports.checkUpcoming = asyncHandler(async (req, res, next) => {
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
      {
        _id: 1,
        game: 1,
        nextDrawDate: 1,
        currentJackpot: 1
      }
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
      {
        _id: 1,
        game: 1,
        nextDrawDate: 1,
        currentJackpot: 1
      }
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
    refreshResults = await refreshUpcoming(needPb, needMega); // NOTE: ** (false, false) ** for testing, should be (needPb, needMega);
  } catch (error) {
    // console.log(`${error}`);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }

  if (!needPb) {
    // From DB
    pbReturn._id = nextDDPb[0]._doc._id;
    pbReturn.game = 'PowerBall';
    pbReturn.currentJackpot = nextDDPb[0]._doc.currentJackpot;
    pbReturn.nextDrawDate = nextDDPb[0]._doc.nextDrawDate;
  } else {
    // From API call
    pbReturn = { ...refreshResults[0] };
  }

  if (!needMega) {
    // From DB
    megaReturn._id = nextDDMega[0]._doc._id;
    megaReturn.game = 'Mega Millions';
    megaReturn.currentJackpot = nextDDMega[0]._doc.currentJackpot;
    megaReturn.nextDrawDate = nextDDMega[0]._doc.nextDrawDate;
  } else {
    // From API call
    megaReturn = { ...refreshResults[1] };
  }

  return res.status(200).json({
    success: true,
    pbResult: pbReturn,
    megaResult: megaReturn
  });
});
