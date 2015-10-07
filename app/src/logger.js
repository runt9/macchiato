var moment = require('moment');
var util = require('util');
var config = require('config');
var _ = require('lodash');

var logger = {
    debugLog: config.logging.debug,

    formatMsg: function(msg) {
        msg = _.values(msg);
        return util['format'].apply(null, msg);
    },

    log: function(severity) {
        var msg = this.formatMsg(arguments[1]);
        console.log('[ %s | %s ]: %s',
            moment().format('YYYY-MM-DD HH:mm:ss.SSS'), severity, msg);
    },

    info: function() {
        this.log('INFO', arguments);
    },

    error: function() {
        this.log('ERROR', arguments);
    },

    debug: function() {
        if (this.debugLog) {
            this.log('DEBUG', arguments);
        }
    }
};

module.exports = logger;