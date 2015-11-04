var Base = require('model/base');

/**
 * Create a new Person.
 * @param name
 * @constructor
 */
var Person = function(name) {
    Base.call(this, 'person');
    this.name = name;
    this.votes = {};
};

Person.prototype = Object.create(Base.prototype);
Person.prototype.constructor = Person;

/**
 * Adds a vote for a person based on a topic.
 * @param topic
 */
Person.prototype.addVote = function(topic) {
    if (this.votes.hasOwnProperty(topic.id)) {
        this.votes[topic.id] += 1;
    } else {
        this.votes[topic.id] = 1;
    }
};

/**
 * Removes a vote for a person based on topic.
 * @param topic
 */
Person.prototype.removeVote = function(topic) {
    if (this.votes.hasOwnProperty(topic.id) && this.votes[topic.id] > 0) {
        this.votes[topic.id] -= 1;
    }
};

module.exports = Person;