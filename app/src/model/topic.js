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
    this.discussingVotes = 0;
};

Topic.prototype = Object.create(Base.prototype);
Topic.prototype.constructor = Topic;

Topic.prototype.STATUS_TO_DISCUSS = 'STATUS_TO_DISCUSS';
Topic.prototype.STATUS_OPEN_VOTING = 'STATUS_OPEN_VOTING';
Topic.prototype.STATUS_DISCUSSING = 'STATUS_DISCUSSING';
Topic.prototype.STATUS_DISCUSSING_VOTING = 'STATUS_DISCUSSING_VOTING';
Topic.prototype.STATUS_DONE = 'STATUS_DONE';

Topic.prototype.validStatuses = [
    Topic.prototype.STATUS_TO_DISCUSS,
    Topic.prototype.STATUS_OPEN_VOTING,
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
 * Adds a discussing vote to this topic.
 */
Topic.prototype.addDiscussingVote = function() {
    this.discussingVotes += 1;
};

/**
 * Removes a vote from this topic.
 */
Topic.prototype.removeDiscussingVote = function() {
    this.discussingVotes -= 1;
};

module.exports = Topic;