var nconf = require('nconf');
var path = require('path');

function getEnvironment() {
    if (process.env.NODE_ENV) {
        return process.env.NODE_ENV;
    }

    return 'dev';
}

nconf.argv().env().file({
    file: path.join(__dirname, '../../config.json')
});

var config = nconf.get(getEnvironment());

module.exports = config;
