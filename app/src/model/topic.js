var Base = require('model/base');
var _ = require('lodash');

/**
 * Create a new topic.
 * @param text
 * @constructor
 */
var Topic = function(text) {
    Base.call(this, 'topic');
    this.text = text;
    this.votes = 0;
    this.status = 'STATUS_TO_DISCUSS';
    this.discussingVotes = {};
};

Topic.prototype = Object.create(Base.prototype);
Topic.prototype.constructor = Topic;

Topic.prototype.STATUS_TO_DISCUSS = 'STATUS_TO_DISCUSS';
Topic.prototype.STATUS_DISCUSSING = 'STATUS_DISCUSSING';
Topic.prototype.STATUS_DISCUSSING_VOTING = 'STATUS_DISCUSSING_VOTING';
Topic.prototype.STATUS_DONE = 'STATUS_DONE';

Topic.prototype.validStatuses = [
    Topic.prototype.STATUS_TO_DISCUSS,
    Topic.prototype.STATUS_DISCUSSING,
    Topic.prototype.STATUS_DISCUSSING_VOTING,
    Topic.prototype.STATUS_DONE
];

/**
 * Checks the given status to see if it's valid.
 * @param status
 * @returns {boolean}
 */
Topic.prototype.isValidStatus = function(status) {
    return _.indexOf(this.validStatuses, status) > -1;
};

/**
 * Updates this topic's current status.
 * @param status
 */
Topic.prototype.updateStatus = function(status) {
    this.status = status;
};

/**
 * Adds a vote to this topic.
 */
Topic.prototype.addVote = function() {
    this.votes += 1;
};

/**
 * Removes a vote from this topic.
 */
Topic.prototype.removeVote = function() {
    if (this.votes === 0) {
        return;
    }

    this.votes -= 1;
};

/**
 * Sets the given person voted positively on this topic.
 */
Topic.prototype.personPositiveDiscussingVote = function(person) {
    this.discussingVotes[person.id] = true;
};

/**
 * Sets the given person voted negatively on this topic.
 */
Topic.prototype.personNegativeDiscussingVote = function(person) {
    this.discussingVotes[person.id] = false;
};

/**
 * Determines if a topic should continue to be discussed.
 * @param people
 * @returns {boolean}
 */
Topic.prototype.shouldContinueDiscussing = function(people) {
    var positiveVoted = _.values(_.pick(this.discussingVotes, function(n) {
        return n === true;
    })).length;

    var negativeVoted = people - positiveVoted;
    // Unanimous negative vote to stop talking about the topic.
    if (this.status === Topic.TOPIC_STATUS_DISCUSSING) {
        return people > negativeVoted;
    }

    // Half or more of the people want to continue talking.
    console.log(positiveVoted);
    console.log(people);
    return positiveVoted >= (people / 2);
};

module.exports = Topic;