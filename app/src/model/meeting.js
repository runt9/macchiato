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
    this.admin = admin.id;
    this.settings = settings;
    this.people = [admin];
    this.topics = [];
    this.status = 'STATUS_TOPICS_OPEN';
};

Meeting.prototype = Object.create(Base.prototype);
Meeting.prototype.constructor = Meeting;

Meeting.prototype.STATUS_TOPICS_OPEN = 'STATUS_TOPICS_OPEN';
Meeting.prototype.STATUS_VOTING_OPEN = 'STATUS_VOTING_OPEN';
Meeting.prototype.STATUS_VOTING_CLOSED = 'STATUS_VOTING_CLOSED';
Meeting.prototype.STATUS_DISCUSSING = 'STATUS_DISCUSSING';
Meeting.prototype.STATUS_DISCUSSING_VOTING = 'STATUS_DISCUSSING_VOTING';
Meeting.prototype.STATUS_DONE = 'STATUS_DONE';

Meeting.prototype.validStatuses = [
    Meeting.prototype.STATUS_TOPICS_OPEN,
    Meeting.prototype.STATUS_VOTING_OPEN,
    Meeting.prototype.STATUS_VOTING_CLOSED,
    Meeting.prototype.STATUS_DISCUSSING,
    Meeting.prototype.STATUS_DISCUSSING_VOTING,
    Meeting.prototype.STATUS_DONE
];

/**
 * Checks the given status to see if it's valid.
 * @param status
 * @returns {boolean}
 */
Meeting.prototype.isValidStatus = function(status) {
    return _.indexOf(this.validStatuses, status) > -1;
};

/**
 * Updates this meeting's current status.
 * @param status
 */
Meeting.prototype.updateStatus = function(status) {
    this.status = status;
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
 * Promotes a person to admin. Returns true on success.
 * @param personId
 * @returns {boolean}
 */
Meeting.prototype.personPromote = function (personId) {
    var person = _.find(this.people, function(person) {
        return person.id === personId;
    });

    if (person === undefined) {
        return false;
    }

    this.admin = person.id;
    return true;
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