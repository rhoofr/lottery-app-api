const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });

  console.log(
    `MongoDB Connected: ${process.env.MONGO_URI}`.cyan.underline.bold
  );
};

module.exports = connectDB;
