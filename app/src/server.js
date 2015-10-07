require('app-module-path').addPath(__dirname);
var app = require('index'),
    config = require('config'),
    logger = require('logger');

// Server init
app.listen(config.express.port, config.express.ip, function(error) {
    if (error) {
        logger.error(error);
        process.exit(1);
    }

    logger.info('Server started in %s mode and listening at http://%s:%s',
        app.settings.env, config.express.ip, config.express.port);
});