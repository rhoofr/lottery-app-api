const express = require('express');
const { retrieveWinningNumbers } = require('../controllers/winningNumbers');
const { checkUpcoming } = require('../controllers/upcomingDrawings');
const { checkResults, getResults } = require('../controllers/results');
const {
  createNumbersPlayed,
  retrieveNumbersPlayed,
  getNumbersPlayedById,
  deleteNumbersPlayedById,
  updateNumbersPlayed,
  getDrawsForTicket
} = require('../controllers/numbersPlayed');
const { seed, regexTest } = require('../controllers/seeder');

const router = express.Router();

// /api/v1/lottery/numbersplayed
router.post('/numbersplayed', createNumbersPlayed);

// /api/v1/lottery/numbersplayed
router.get('/numbersplayed', retrieveNumbersPlayed);

// /api/v1/lottery/numbersplayed/:id
router.get('/numbersplayed/:id', getNumbersPlayedById);

// /api/v1/lottery/numbersplayed/:id
router.patch('/numbersplayed/:id', updateNumbersPlayed);

// /api/v1/lottery/numbersplayed/:id
router.delete('/numbersplayed/:id', deleteNumbersPlayedById);

// /api/v1/lottery/numbersplayed/:id
router.get('/drawsforticket/:id', getDrawsForTicket);

// /api/v1/lottery/winningnumbers
router.get('/winningnumbers', retrieveWinningNumbers);

// /api/v1/lottery/checkupcoming
router.get('/checkupcoming', checkUpcoming);

// /api/v1/lottery/checkresults
router.get('/checkresults', checkResults);

// /api/v1/lottery/results
router.get('/results', getResults);

// /api/v1/lottery/seed
// Used to seed the db from the backed up json files.
router.get('/seed', seed);

// /api/v1/lottery/regex
// Testing regular expressions.
router.get('/regex', regexTest);

module.exports = router;
