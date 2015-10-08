/**
 * This file contains the "in-memory database", or as it really is, a blob of JS objects, as well as
 * handlers and helpers to pick at and update the data. We will move to a real database soon, but right now,
 * losing history on server restart is not a problem since we're building an alpha version.
 */
var logger = require('logger');
var _ = require('lodash');
var Meeting = require('model/meeting');

var db = {
    meetings: [],

    /**
     * Creates a new meeting.
     * @param settings
     * @param admin
     * @returns {Meeting}
     */
    createMeeting: function (settings, admin) {
        var meeting = new Meeting(settings, admin);
        this.meetings.push(meeting);
        logger.info('Created meeting with id [%s]', meeting.id);

        return meeting;
    },

    /**
     * Gets a meeting by id.
     * @param meetingId
     * @returns {Meeting}
     */
    getMeeting: function (meetingId) {
        var meeting = _.find(this.meetings, function (meeting) {
            return meeting.id === meetingId;
        });

        return meeting === undefined ? null : meeting;
    }
};

module.exports = db;