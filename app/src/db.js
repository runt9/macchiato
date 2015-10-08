/**
 * This file contains the "in-memory database", or as it really is, a blob of JS objects, as well as
 * handlers and helpers to pick at and update the data. We will move to a real database soon, but right now,
 * losing history on server restart is not a problem since we're building an alpha version.
 */
var logger = require('logger');
var moment = require('moment');
var crypto = require('crypto');

var db = {
    data: {},

    /**
     * Generates a GUID (Globally Unique IDentifer) based on a given string and the current timestamp
     * in milliseconds. This puts together the given string and the timestamp, does an SHA1 has on it,
     * then returns the first 10 characters of said hash.
     * @param str
     * @returns {string}
     */
    generateGuid: function (str) {
        return crypto.createHash('sha1').update(str + moment().format('x')).digest('hex').substr(1, 10);
    },

    /**
     * Given an admin GUID, creates a new meeting and returns the meeting GUID.
     * @param adminGuid
     * @returns {string}
     */
    createMeeting: function (adminGuid) {
        var meetingGuid = this.generateGuid('meeting');
        this.data[meetingGuid] = {
            admin: adminGuid,
            people: [],
            topics: []
        };
        logger.info('Created meeting with id [%s]', meetingGuid);

        return meetingGuid;
    },

    /**
     * Given a meeting GUID, gets the meeting from our "DB". Throws an error on failure to find meeting.
     * @param meetingId
     * @returns {Object}
     */
    getMeeting: function (meetingId) {
        if (!this.data.hasOwnProperty(meetingId)) {
            throw new Error('Unable to load meeting by meeting id ' + meetingId);
        }

        return this.data[meetingId];
    }
};

module.exports = db;