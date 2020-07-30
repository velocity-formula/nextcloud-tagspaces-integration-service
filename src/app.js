/**
 *
 * Author:  gmazzotta
 *
 * License: GNU - Copyright (c) Velocity Formula
 * @link
 *
 */


// ENVIRONMENT
 require('dotenv-safe').config({ path: `${__dirname}/config/.env`, sample: `${__dirname}/config/.env.example`,  allowEmptyValues: false});

// global_functions and configurations
require ('./lib/global_functions');
require ('./config/app.config');

// Express Framework module
const express    = require('express');
const logger     = require('morgan');
const bodyParser = require('body-parser');
const helmet     = require('helmet');
const cors       = require('cors');
const http       = require('http');
const eclv       = require('express-content-length-validator');

const routes     = require('./routes/_index');
const app        = express();

app.use(logger('dev'));
app.use(bodyParser.json({limit: '100mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}))
app.use(eclv.validateMax({max: 999}));
app.use(helmet());
app.options('*', cors())
app.use(cors({
  origin: process.env.CORS_ALLOW_ORIGINS,
	methods: process.env.CORS_ALLOW_METHODS,
  credentials: process.env.CORS_ALLOW_CREDENTIAL_HEADER,
  preflightContinue: true
}));

// Routes
app.use('/', routes);

// Server
const server = http.createServer(app);
server.listen(process.env.APP_PORT);
server.on('error', onError);
server.on('listening', onListening);


// Recurrent Tasks
let recurrentTasks;


function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let port = process.env.APP_PORT;
  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  console.log("----------------------------------------------------------");
  console.log("--  APP: %s  %s ", process.env.APP_NAME, process.env.APP_PORT);
  console.log("----------------------------------------------------------");

  recurrentTasks = require('./controllers/recurrent');

 }

process.on('SIGINT', function(msg) {
  server.close(function(err) {
    console.log('Terminating recurrent job...');
    recurrentTasks.terminate();
    recurrentTasks = undefined;
    console.log('Closing server...');
    server.close();
    if (err){
       // to do closing stuff.
       console.error(err);
       process.exit(1);
    }
  });
});


module.exports = app;

