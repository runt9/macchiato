var moment = require('moment');
var util = require('util');
var config = require('config');
var lodash = require('lodash');

var logger = {
    debugLog: config.logging.debug,

    formatMsg: function (msg) {
        msg = lodash.values(msg);
        return util.format.apply(null, msg);
    },

    log: function (severity, args) {
        var msg = this.formatMsg(args[1]);
        console.log('[ %s | %s ]: %s',
            moment().format('YYYY-MM-DD HH:mm:ss.SSS'), severity, msg);
    },

    info: function () {
        this.log('INFO', arguments);
    },

    error: function () {
        this.log('ERROR', arguments);
    },

    debug: function () {
        if (this.debugLog) {
            this.log('DEBUG', arguments);
        }
    }
};

module.exports = logger;