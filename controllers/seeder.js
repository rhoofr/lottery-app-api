const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const asyncHandler = require('../middleware/async');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load Models
const Result = require('../models/Result');
const PlayedNumber = require('../models/PlayedNumber');
const WinningNumbers = require('../models/WinningNumber');

// Import into DB
/**
 * @desc      Seed the db.
 * @route     Get /api/v1/lottery/seed
 * @access    Public
 */
exports.seed = asyncHandler(async (req, res, next) => {
  // console.log(path.join(__dirname, '../_data/playedNumbers.json'));
  const numberPlayedPath = path.join(__dirname, '../_data/playedNumbers.json');
  const resultsPath = path.join(__dirname, '../_data/results.json');
  const winningNumbersPath = path.join(
    __dirname,
    '../_data/winning_numbers.json'
  );
  // Read the JSON files
  const playedNumbers = JSON.parse(fs.readFileSync(numberPlayedPath, 'utf-8'));
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  const winningNumbers = JSON.parse(
    fs.readFileSync(winningNumbersPath, 'utf-8')
  );

  // const results = JSON.parse(
  //   fs.readFileSync(`${__dirname}/_data/results.json`, 'utf-8')
  // );

  const ids = [];
  try {
    /* THESE THREE ARE DONE
    // Convert the date strings to dates
    for (let playedNumber of playedNumbers) {
      playedNumber.startDate = new Date(playedNumber.startDate);
      playedNumber.endDate = new Date(playedNumber.endDate);
      // console.log(`playedNumber`, playedNumber);
      const number = await PlayedNumber.create(playedNumber);
      ids.push({ id: playedNumber.id, _id: number._id });
    }

    // Convert the date strings to dates
    for (let result of results) {
      result.drawDate = new Date(result.drawDate);
      const idx = ids.findIndex(
        element => element.id === result.numbersPlayedId
      );
      result.numbersPlayedId = ids[idx];
      const savedResult = await Result.create(result);
    }

    for (let winningNumber of winningNumbers) {
      winningNumber.drawDate = new Date(winningNumber.drawDate);
      const savedResult = await WinningNumbers.create(winningNumber);
    }
    */

    // console.log(ids);
    // const numbers = await PlayedNumber.create(playedNumbers);
    console.log('Data Imported...'.green.inverse);
  } catch (err) {
    console.error(err);
  }
  res.status(200).json({
    success: true,
    count: winningNumbers.length,
    data: winningNumbers
  });
});

/**
 * @desc      Testing my regex expressions.
 * @route     Get /api/v1/lottery/regex
 * @access    Public
 */
exports.regexTest = asyncHandler(async (req, res, next) => {
  let regEx;
  console.log('Testing 0 - 69');
  // regEx = /\b([1-9]|[1-6][0-9])\b/;
  regEx = /\b(0?[1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9])\b/;
  for (let i = 0; i <= 69; i++) {
    if (regEx.test(i)) {
      // Nothing
    } else {
      console.log(`Value ${i} does not pass`);
    }
  }

  console.log('Testing 0 - 75');
  // regEx = /\b(0?[1-9]|[1-6][0-9]|70)\b/;
  regEx = /\b(0?[1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-5])\b/;
  for (let i = 0; i <= 75; i++) {
    if (regEx.test(i)) {
      // Nothing
    } else {
      console.log(`Value ${i} does not pass`);
    }
  }

  console.log('Testing 0 - 70');
  // regEx = /\b(0?[1-9]|[1-6][0-9]|70)\b/;
  regEx = /\b(0?[1-9]|[1-6][0-9]|70)\b/;
  for (let i = 0; i <= 70; i++) {
    if (regEx.test(i)) {
      // Nothing
    } else {
      console.log(`Value ${i} does not pass`);
    }
  }

  console.log('Testing 0 - 26');
  regEx = /\b(0?[1-9]|1[0-9]|2[0-6])\b/;
  for (let i = 0; i <= 26; i++) {
    if (regEx.test(i)) {
      // Nothing
    } else {
      console.log(`Value ${i} does not pass`);
    }
  }

  console.log('Testing 0 - 25');
  regEx = /\b(0?[1-9]|1[0-9]|2[0-5])\b/;
  for (let i = 0; i <= 25; i++) {
    if (regEx.test(i)) {
      // Nothing
    } else {
      console.log(`Value ${i} does not pass`);
    }
  }

  res.status(200).json({
    success: true
  });
});
// const importData = async () => {
//   console.log('hello from importData');

//   const ids = [];
//   try {
//     // Convert the date strings to dates
//     for (let playedNumber of playedNumbers) {
//       playedNumber.startDate = new Date(playedNumber.startDate);
//       playedNumber.endDate = new Date(playedNumber.endDate);
//       const number = await PlayedNumber.create(playedNumber);
//       ids.push({ id: playedNumber.id, _id: number._id });
//     }

//     console.log(ids);
//     // const numbers = await PlayedNumber.create(playedNumbers);
//     console.log(`Data Imported...`.green.inverse);
//     process.exit();
//   } catch (err) {
//     console.error(err);
//   }
// };
