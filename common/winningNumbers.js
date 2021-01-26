/* eslint-disable operator-linebreak */
const { default: axios } = require('axios');
const WinningNumbers = require('../models/WinningNumber');
const Result = require('../models/Result');

/**
 * @desc      Helper function to parse results.  They have different formats for PB and Mega.
 * @param {string} data - The date from the API to parse into a standard return object.
 * @param {string} game - Which game to check P or M.
 * @return {object} The parsed results.
 */
const parseResults = (data, game) => {
  const allNumbers = data.winning_numbers.split(' ').map(Number);
  const retObj = {};

  for (let i = 0; i < allNumbers.length; i++) {
    switch (i) {
      case 0:
        retObj.first = allNumbers[i];
        break;
      case 1:
        retObj.second = allNumbers[i];
        break;
      case 2:
        retObj.third = allNumbers[i];
        break;
      case 3:
        retObj.fourth = allNumbers[i];
        break;
      case 4:
        retObj.fifth = allNumbers[i];
        break;
      case 5:
        if (game === 'P') {
          retObj.ball = allNumbers[i];
        }
        break;
      default:
        break;
    }
  }

  if (game === 'M') retObj.ball = Number(data.mega_ball);
  retObj.game = game;
  retObj.drawDate = new Date(data.draw_date);

  return retObj;
};

/**
 * @desc      Get winning numbers from outside API and save to WinningNumbers collection
 * @param {string} dateToCheck - The date to get the winning numbers for.
 * @param {string} game - Which game to check P or M.
 * @return {object} The winning numbers results.
 */
exports.getWinningNumbers = async (drawDate, game) => {
  game = game.toUpperCase(); // Make sure its uppercase
  const dateToCheck = new Date(drawDate);
  const date = dateToCheck.getDate();
  const month = dateToCheck.getMonth() + 1;
  const year = dateToCheck.getFullYear();
  const dateToSend = `${year}-${month}-${date}T00:00:00`;
  let URI;

  if (game === 'M') {
    URI = `${process.env.NY_DATA_MEGA_URI}?draw_date=${dateToSend}`; // Mega
  } else {
    URI = `${process.env.NY_DATA_PB_URI}?draw_date=${dateToSend}`; // PB
  }

  try {
    // First see if we already have the winning numbers for this date and game
    const currResults = await WinningNumbers.find({ game, drawDate });

    if (currResults.length > 0) {
      return {
        game: currResults[0].game,
        first: currResults[0].first,
        second: currResults[0].second,
        third: currResults[0].third,
        fourth: currResults[0].fourth,
        fifth: currResults[0].fifth,
        ball: currResults[0].ball,
        drawDate: currResults[0].drawDate
      };
    }

    const response = await axios({
      method: 'GET',
      url: URI,
      headers: {
        'content-type': 'application/json',
        app_token: process.env.NY_DATA_APP_TOKEN
      }
    });

    if (!response.data || !response.data.length > 0) {
      throw new Error('No results returned from API call.');
    }

    const returnObj = parseResults(response.data[0], game);

    // Save to dB
    const winningNumbers = new WinningNumbers(returnObj);
    await winningNumbers.save();

    return returnObj;
  } catch (error) {
    console.log(`fetchWinningNumbers error: ${error}`);
    throw new Error(`fetchWinningNumbers error: ${error}`);
  }
};

/**
 * @desc  Checks the nbrs played against the results for total nbr of matches (not including ball)
 * @param {object} numsPlayed - The date to get the winning numbers for.
 * @param {object} megaResults - Which game to check P or M.
 * @return nothing unless error then throws error.
 */
const calculateNumbersMatched = (numsPlayed, drawingReturn) => {
  let numberToCheck = 0;
  let matchedNumbers = 0;

  for (let i = 0; i < 5; i++) {
    switch (i) {
      case 0:
        numberToCheck = numsPlayed.first;
        break;
      case 1:
        numberToCheck = numsPlayed.second;
        break;
      case 2:
        numberToCheck = numsPlayed.third;
        break;
      case 3:
        numberToCheck = numsPlayed.fourth;
        break;
      case 4:
        numberToCheck = numsPlayed.fifth;
        break;
      default:
        break;
    }

    if (
      numberToCheck === drawingReturn.first ||
      numberToCheck === drawingReturn.second ||
      numberToCheck === drawingReturn.third ||
      numberToCheck === drawingReturn.fourth ||
      numberToCheck === drawingReturn.fifth
    ) {
      matchedNumbers++;
    }
  }
  return matchedNumbers;
};

/**
 * @desc  Determine if it is time for a new ticket.
 * @param {object} numsPlayed - Numbers played.
 * @return True/False.
 */
const checkTimeForNewTicket = (numbersPlayed) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  return numbersPlayed.endDate.valueOf() <= date.valueOf();
};

/**
 * @desc      Calculate and store Mega results.
 * @param {object} numsPlayed - Numbers played.
 * @param {object} megaResults - Results.
 * @param {array} returnResults - Push the results from this call to the returnResults.
 * @return nothing unless error then throws error.
 */
exports.calculateMegaWinnings = async (numsPlayed, megaResults) => {
  let matchedNumbers = 0;
  let ballMatched = false;
  let amount = 0;
  const result = new Result();

  matchedNumbers = calculateNumbersMatched(numsPlayed, megaResults);

  if (numsPlayed.ball === megaResults.ball) ballMatched = true;

  if (matchedNumbers === 0 && ballMatched) amount = 2;
  else if (matchedNumbers === 1 && ballMatched) amount = 4;
  else if (matchedNumbers === 2 && ballMatched) amount = 10;
  else if (matchedNumbers === 3 && !ballMatched) amount = 10;
  else if (matchedNumbers === 3 && ballMatched) amount = 200;
  else if (matchedNumbers === 4 && !ballMatched) amount = 500;
  else if (matchedNumbers === 4 && ballMatched) amount = 10000;
  else if (matchedNumbers === 5 && !ballMatched) amount = 1000000;
  else if (matchedNumbers === 5 && ballMatched) amount = 100000000;

  result.game = 'M';
  result.timeForNewTicket = checkTimeForNewTicket(numsPlayed);
  result.drawDate = megaResults.drawDate;
  result.numbersMatched = matchedNumbers;
  result.ballMatched = ballMatched;
  result.currentWinnings = amount;
  result.numbersPlayedId = numsPlayed._id;

  try {
    await result.save();
  } catch (e) {
    throw new Error(e);
  }
};

/**
 * @desc      Calculate and store PB results.
 * @param {object} numsPlayed - Numbers played.
 * @param {object} pbResults - Results.
 * @param {array} returnResults - Push the results from this call to the returnResults.
 * @return nothing unless error then throws error.
 */
exports.calculatePBWinnings = async (numsPlayed, pbResults) => {
  let matchedNumbers = 0;
  let ballMatched = false;
  let amount = 0;
  const result = new Result();

  matchedNumbers = calculateNumbersMatched(numsPlayed, pbResults);

  if (numsPlayed.ball === pbResults.ball) ballMatched = true;

  if (matchedNumbers === 0 && ballMatched) amount = 2;
  else if (matchedNumbers === 1 && ballMatched) amount = 4;
  else if (matchedNumbers === 2 && ballMatched) amount = 10;
  else if (matchedNumbers === 3 && !ballMatched) amount = 10;
  else if (matchedNumbers === 3 && ballMatched) amount = 200;
  else if (matchedNumbers === 4 && !ballMatched) amount = 500;
  else if (matchedNumbers === 4 && ballMatched) amount = 10000;
  else if (matchedNumbers === 5 && !ballMatched) amount = 1000000;
  else if (matchedNumbers === 5 && ballMatched) amount = 100000000;

  result.game = 'P';
  result.timeForNewTicket = checkTimeForNewTicket(numsPlayed);
  result.drawDate = pbResults.drawDate;
  result.numbersMatched = matchedNumbers;
  result.ballMatched = ballMatched;
  result.currentWinnings = amount;
  result.numbersPlayedId = numsPlayed._id;

  try {
    await result.save();
  } catch (e) {
    throw new Error(e);
  }
};
