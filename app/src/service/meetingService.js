var logger = require('logger'),
    db = require('db');

var meetingService = {
    /**
     * Creates a new meeting by generating an admin GUID and passing that to the DB handler.
     * @returns {string}
     */
    createMeeting: function() {
        var adminGuid = db.generateGuid('admin');
        return db.createMeeting(adminGuid);
    },

    /**
     * Gets a meeting by a given meeting GUID. Handles nonexistant meetings and returns null.
     * @param meetingId
     * @returns {Object}
     */
    getMeeting: function(meetingId) {
        try {
            var meeting = db.getMeeting(meetingId);
        } catch(e) {
            logger.error('Failed to load meeting by meeting id [%s]', meetingId);
            return null;
        }

        return meeting;
    }
};

module.exports = meetingService;