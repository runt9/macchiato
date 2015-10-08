var moment = require('moment');
var crypto = require('crypto');

/**
 * Generates a GUID (Globally Unique IDentifer) based on a given string and the current timestamp
 * in milliseconds. This puts together the given string and the timestamp, does an SHA1 has on it,
 * then returns the first 10 characters of said hash.
 * @param str
 * @returns {string}
 */
function generateGuid (str) {
    return crypto.createHash('sha1').update(str + moment().format('x')).digest('hex').substr(1, 10);
}

/**
 * Base model object.
 * @param type
 * @constructor
 */
var Base = function(type) {
    this.id = generateGuid(type);
};

module.exports = Base;