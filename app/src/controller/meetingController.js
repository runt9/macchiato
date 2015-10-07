var router = require('express').Router(),
    logger = require('logger'),
    meetingService = require('service/meetingService');

// Endpoint to create a new meeting
router.get('/meeting', function(req, res) {
    logger.debug('meeting');
    var meetingGuid = meetingService.createMeeting();
    res.status(201).send(meetingGuid);
});

// Endpoint to get an existing meeting by id and return its data
router.get('/meeting/:id', function(req, res) {
    var meetingId = req.params.id;

    logger.debug('meeting %s', meetingId);
    var meeting = meetingService.getMeeting(meetingId);
    if (meeting === null) {
        res.status(404).send('Failed to find meeting ' + meetingId);
    } else {
        res.status(200).send(meeting);
    }
});

module.exports = router;