var utility = require('utility');
/**
 * Base model object.
 * @param type
 * @constructor
 */
var Base = function(type) {
    this.id = utility.generateGuid(type);
};

module.exports = Base;