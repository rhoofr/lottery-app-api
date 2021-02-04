const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load Models
const Result = require('./models/Result');
const PlayedNumber = require('./models/PlayedNumber');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

// Read the JSON files
const playedNumbers = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/playedNumbers.json`, 'utf-8')
);

const results = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/results.json`, 'utf-8')
);

// Convert the date strings to dates
for (const result of results) {
  result.drawDate = new Date(result.drawDate);
}

// Import into DB
const importData = async () => {
  console.log('hello from importData');
  // await getConnection();

  const ids = [];
  try {
    // Convert the date strings to dates
    for (const playedNumber of playedNumbers) {
      playedNumber.startDate = new Date(playedNumber.startDate);
      playedNumber.endDate = new Date(playedNumber.endDate);
      const number = await PlayedNumber.create(playedNumber);
      ids.push({ id: playedNumber.id, _id: number._id });
    }

    console.log(ids);
    // const numbers = await PlayedNumber.create(playedNumbers);
    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    // await Bootcamp.deleteMany();
    // console.log(`Data Deleted...`.red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
  process.exit();
} else if (process.argv[2] === '-d') {
  deleteData();
  process.exit();
}
