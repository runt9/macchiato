var express = require('express');
var config = require('config');
var logger = require('logger');
var app = express();

// Initial config
logger.debug('Configuring');
app.set('view engine', 'jade');
app.set('views', __dirname + '/view');

// Middleware setup
logger.debug('Setting up middleware');
app.use(express.static('resources'));

// Router imports
logger.debug('Loading routers');
app.use(require('controller/indexController'));
app.use(require('controller/meetingController'));

// Error handler import
app.use(require('controller/errorController'));

module.exports = app;