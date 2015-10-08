var router = require('express').Router();
var logger = require('logger');
var meetingService = require('service/meetingService');

// Endpoint to create a new meeting
router.get('/meeting', function (req, res) {
    logger.debug('meeting [%s]', req.url);
    var meetingGuid = meetingService.createMeeting();
    res.status(201).send(meetingGuid);
});

// Endpoint to get an existing meeting by id and return its data
router.get('/meeting/:id', function (req, res) {
    var meetingId = req.params.id,
        meeting;

    logger.debug('meeting %s', meetingId);
    meeting = meetingService.getMeeting(meetingId);
    if (meeting === null) {
        res.status(404).send('Failed to find meeting ' + meetingId);
    } else {
        res.status(200).send(meeting);
    }
});

module.exports = router;