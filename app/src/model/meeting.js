var Base = require('model/base');
var Person = require('model/person');
var Topic = require('model/topic');
var _ = require('lodash');

/**
 * Create a new meeting.
 * @param settings
 * @param admin
 * @constructor
 */
var Meeting = function(settings, admin) {
    Base.call(this, 'meeting');
    this.admin = admin;
    this.settings = settings;
    this.people = [admin];
    this.topics = [];
};

Meeting.prototype = Object.create(Base.prototype);
Meeting.prototype.constructor = Meeting;

/**
 * Gets a person for a meeting. Returns null on failure.
 * @param personId
 * @returns {Person}
 */
Meeting.prototype.getPerson = function(personId) {
    var person = _.find(this.people, function (person) {
        return person.id === personId;
    });

    return person === undefined ? null : person;
};

/**
 * Creates a new person with the given name and joins them to our meeting.
 * @param personName
 * @returns {Person}
 */
Meeting.prototype.personJoin = function(personName) {
    var person = new Person(personName);
    this.people.push(person);
    return person;
};

/**
 * Removes a person from this meeting. Returns true on success.
 * @param personId
 * @returns {boolean}
 */
Meeting.prototype.personRemove = function (personId) {
    var removed = _.remove(this.people, function (person) {
        return person.id === personId;
    });

    return removed.length === 1;
};

/**
 * Gets a topic for this meeting. Returns null on failure.
 * @param topicId
 * @returns {Topic}
 */
Meeting.prototype.getTopic = function(topicId) {
    var topic = _.find(this.topics, function (topic) {
        return topic.id === topicId;
    });

    return topic === undefined ? null : topic;
};

/**
 * Adds the given topic to this meeting.
 * @param topicText
 * @returns {Topic}
 */
Meeting.prototype.addTopic = function (topicText) {
    var topic = new Topic(topicText);
    this.topics.push(topic);
    return topic;
};

/**
 * Removes a topic from this meeting. Returns true on success.
 * @param topicId
 * @returns {boolean}
 */
Meeting.prototype.topicRemove = function (topicId) {
    var removed = _.remove(this.topics, function (topic) {
        return topic.id === topicId;
    });

    return removed.length === 1;
};

module.exports = Meeting;