const express = require('express');
const fileUpload = require('express-fileupload');
const globalErrorHandler = require('./controllers/errorController');
const orderRouter = require('./routes/orderRouter');
const path = require('path');
const AppError = require('./utils/appError');
const cors = require('cors');
const zip = require('express-easy-zip');
const userRouter = require('./routes/userRouter');
const cookieParser = require('cookie-parser');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const compression = require('compression');

const app = express();

app.enable('trust proxy');

// Set security HTTP headers
app.use(helmet());
// Limit requests from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

app.use(compression());

app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(fileUpload());
app.use(zip());
app.use(
  cors({
    credentials: true,
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://fotoartnis.com/'
        : 'http://localhost:3000'
  })
);
app.options(
  '*',
  cors({
    credentials: true,
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://fotoartnis.com/'
        : 'http://localhost:3000'
  })
);

//upload to local endpoint
//app.post('/upload', orderController.upload);
app.use(express.static(path.join(__dirname, 'client/build')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
