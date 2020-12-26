require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./config');
const express = require('express');
const cors = require('cors');
const middleware = require('./middleware');
const routes = require('./routes');
const app = express();

app.use(cors());
app.use('/static', express.static(`${config.rootPath}/public`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

app.use(middleware.errorHandler);

mongoose
  .connect(config.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => {
    console.log(err);
    process.exit(1);
  });

const server = app.listen(config.port, () =>
  console.log(
    `\nServer is listening on port ${config.port}\n` +
    `Mode: ${config.env}\n` +
    `MongoDB: ${config.db}\n`
  )
);

const io = require('socket.io')(server);
app.set('socketio',io);

module.exports = app;