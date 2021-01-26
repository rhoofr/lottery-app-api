const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load Models
const Result = require('./models/Result');
const PlayedNumber = require('./models/PlayedNumber');
// const Bootcamps = require('./models/Bootcamp');
// const Course = require('./models/Course');
// const User = require('./models/User');
// const Review = require('./models/Review');

// Connect to DB
//DB Connection
// const getConnection = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useCreateIndex: true,
//       useFindAndModify: false,
//       useUnifiedTopology: true
//     });
//     console.log('Connection to DB Successful');
//   } catch (err) {
//     console.log('Connection to DB Failed');
//   }
// };

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
// const bootcamps = JSON.parse(
//   fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
// );

// const courses = JSON.parse(
//   fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
// );

// const users = JSON.parse(
//   fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
// );

// const reviews = JSON.parse(
//   fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8')
// );

// // Convert the date strings to dates
// for (let playedNumber of playedNumbers) {
//   playedNumber.startDate = new Date(playedNumber.startDate);
//   playedNumber.endDate = new Date(playedNumber.endDate);
// }

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

    // await Result.create(results);
    // await Bootcamp.create(bootcamps);
    // await Course.create(courses);
    // await User.create(users);
    // await Review.create(reviews);
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
    // await Course.deleteMany();
    // await User.deleteMany();
    // await Review.deleteMany();
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
