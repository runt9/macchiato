var moment = require('moment');
var crypto = require('crypto');

var utility = {
    /**
     * Generates a GUID (Globally Unique IDentifer) based on a given string and the current timestamp
     * in milliseconds. This puts together the given string and the timestamp, does an SHA1 has on it,
     * then returns the first 10 characters of said hash.
     * @param str
     * @returns {string}
     */
    generateGuid: function (str) {
        return crypto.createHash('sha1').update(str + moment().format('x')).digest('hex').substr(1, 10);
    }
};

module.exports = utility;
