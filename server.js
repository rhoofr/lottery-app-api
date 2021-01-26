const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const HttpError = require('./models/http-error');

const { getCurrentDateTimeLocal } = require('./utils/datetime');

// try moving up to here
const app = express();

// Load environment vars
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: './config/config.env.test' });
  console.log('loaded test env vars...');
} else {
  dotenv.config({ path: './config/config.env' });
}

// Connect to database
connectDB();

// Route files
const lottery = require('./routes/lottery');

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting (100 requests per 10 minutes)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 1000
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/lottery', lottery);

// Handle any routes not already handled
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route', 404);
  return next(error);
});

// Set up error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV
    } mode on port ${PORT}. Current Date/Time: ${getCurrentDateTimeLocal()}`
      .yellow.bold
  );
});

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server and exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
