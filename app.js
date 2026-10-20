const express = require('express');
const globalErrorHandler = require('./controllers/errorController');
const orderRouter = require('./routes/orderRouter');
const path = require('path');
const AppError = require('./utils/appError');
const cors = require('cors');
const userRouter = require('./routes/userRouter');
const uploadRouter = require('./routes/uploadRouter');
const catalogRouter = require('./routes/catalogRouter');
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
app.use(express.json({ limit: '2mb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

app.use(compression());

//app.use(express.static('public'));
app.use(cookieParser());
// app.use(
//   cors({
//     credentials: true,
//     origin:
//       process.env.NODE_ENV === 'production'
//         ? 'https://fotoartnis.com/'
//         : 'http://localhost:3000'
//   })
// );
// app.options(
//   '*',
//   cors({
//     credentials: true,
//     origin:
//       process.env.NODE_ENV === 'production'
//         ? 'https://fotoartnis.com/'
//         : 'http://localhost:3000'
//   })
// );

//app.use(cors());
//app.options('*', cors());
app.use(function(req, res, next) {
  res.setHeader('Content-Security-Policy', "img-src * data: blob:;");
  return next();
});

app.use(
  express.static(path.join(__dirname, 'client/build'), {
    setHeaders: (res, filePath) => {
      if (path.basename(filePath) === 'index.html') {
        res.setHeader('Cache-Control', 'no-store');
      }
    }
  })
);

app.use('/api/v1/uploads', uploadRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/catalog', catalogRouter);
app.use('/api/v1/users', userRouter);
app.all('/api/*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});
app.get('*', (req, res) => {
  if (path.extname(req.path)) {
    return res.status(404).json({
      status: 'error',
      message: `Can't find ${req.originalUrl} on this server!`
    });
  }

  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

app.use(globalErrorHandler);

module.exports = app;
