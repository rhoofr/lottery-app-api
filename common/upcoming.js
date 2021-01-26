const { default: axios } = require('axios');
const UpcomingDrawing = require('../models/UpcomingDrawing');

/**
 * @desc  Need to update the upcomingDrawings once a month to keep app key from getting locked out.
 * @return {Boolean} True/False.
 */
const upcomingRefreshRequired = async () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  try {
    const nextDD = await UpcomingDrawing.find({}, { _id: 0, nextDrawDate: 1 })
      .sort({ nextDrawDate: -1 })
      .limit(1);

    if (date.getMonth() > nextDD[0].nextDrawDate.getMonth()) return true; // Needed

    return false; // Not needed
  } catch (e) {
    throw new Error(e);
  }
};

/**
 * @desc  Refresh the upcomingDrawings by calling the API and saving to the db.
 * @param {Boolean} pb Whether to refrech PB, defaults to true
 * @param {Boolean} mega whether to refrech Mega, defaults to true
 * @return {Object{PB, Mega}} One object for PB and Mega.
 */
const refreshUpcoming = async (pb = true, mega = true) => {
  let URI;
  let pbResults;
  let megaResults;
  let upcomingPB = {};
  let upcomingMega = {};

  ///////////////////////////
  // Back from api call
  // {
  //   "error" : 0,
  //   "next_draw" : "2016-06-03",
  //   "currency" : "USD",
  //   "jackpot" : "80000000"
  // }
  //////////////////////////

  try {
    if (pb) {
      // First do PB
      URI = `${process.env.MAGAYO_URI}?api_key=${process.env.MAGAYO_API_KEY}&game=us_powerball`; // PB
      pbResults = await axios.get(URI);

      if (pbResults.data.error === 0) {
        // Save to db
        upcomingPB = new UpcomingDrawing({
          game: 'P',
          currentJackpot: pbResults.data.jackpot,
          nextDrawDate: new Date(pbResults.data.next_draw)
        });

        await upcomingPB.save();
      } else {
        console.log(`refreshUpcoming error code: ${pbResults.data.error}`);
      }
    }

    if (mega) {
      // Now Mega
      URI = `${process.env.MAGAYO_URI}?api_key=${process.env.MAGAYO_API_KEY}&game=us_mega_millions`; // Mega
      megaResults = await axios.get(URI);

      if (megaResults.data.error === 0) {
        // Save to db
        upcomingMega = new UpcomingDrawing({
          game: 'M',
          currentJackpot: megaResults.data.jackpot,
          nextDrawDate: new Date(megaResults.data.next_draw)
        });

        await upcomingMega.save();
      } else {
        console.log(`refreshUpcoming error code: ${megaResults.data.error}`);
      }
    }
  } catch (error) {
    console.log(`refreshUpcoming error: ${error}`);
    throw new Error(`refreshUpcoming error: ${error}`);
  }

  // NOTE: next two strictly for testing - MUST REMOVE!!!
  upcomingPB = new UpcomingDrawing({
    game: 'P',
    currentJackpot: '40000000',
    nextDrawDate: new Date('2016-06-03')
  });
  upcomingMega = new UpcomingDrawing({
    game: 'M',
    currentJackpot: '790000000',
    nextDrawDate: new Date('2016-06-03')
  });

  return [
    {
      _id: upcomingPB._id,
      game: 'PowerBall',
      currentJackpot: upcomingPB.currentJackpot,
      nextDrawDate: upcomingPB.nextDrawDate
    },
    {
      _id: upcomingMega._id,
      game: 'Mega Millions',
      currentJackpot: upcomingMega.currentJackpot,
      nextDrawDate: upcomingMega.nextDrawDate
    }
  ];
};

exports.upcomingRefreshRequired = upcomingRefreshRequired;
exports.refreshUpcoming = refreshUpcoming;
