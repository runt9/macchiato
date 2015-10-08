var Base = require('model/base');

/**
 * Create a new Person.
 * @param name
 * @constructor
 */
var Person = function(name) {
    Base.call(this, 'person');
    this.name = name;
};

Person.prototype = Object.create(Base.prototype);
Person.prototype.constructor = Person;

module.exports = Person;