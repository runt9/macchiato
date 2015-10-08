require('app-module-path').addPath(__dirname);
var app = require('index');
var config = require('config');
var logger = require('logger');
var io = require('socket.io');
var apiSocketController = require('controller/apiSocketController');

// Server init
var server = app.listen(config.express.port, config.express.ip, function (error) {
    if (error) {
        logger.error(error);
        process.exit(1);
    }

    logger.info('Server started in %s mode and listening at http://%s:%s',
        app.settings.env, config.express.ip, config.express.port);
});

var socket = io.listen(server);
apiSocketController(socket);