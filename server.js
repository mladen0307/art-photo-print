const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });

const databaseUrl = process.env.DATABASE;
if (!databaseUrl) {
  throw new Error(
    'DATABASE is required. Configure your MongoDB connection.'
  );
}

const databasePassword = process.env.DATABASE_PASSWORD;
if (databaseUrl.includes('<PASSWORD>') && !databasePassword) {
  throw new Error(
    'DATABASE_PASSWORD is required when DATABASE contains the <PASSWORD> placeholder.'
  );
}

const app = require('./app');

const DB = databaseUrl.replace('<PASSWORD>', () => databasePassword);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => { /* server needs to start after db connects to support aws lambda */
    console.log('DB connection successful!')
    const port = process.env.PORT || 5000;
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}...`);
    });

    process.on('unhandledRejection', err => {
      console.log('UNHANDLED REJECTION! 💥 Shutting down...');
      console.log(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    process.on('SIGTERM', () => {
      console.log('🐱‍👤SIGTERM RECEIVED. Shutting down...');
      server.close(() => {
        console.log('🐱‍💻Process terminated');
      });
    });
  });

