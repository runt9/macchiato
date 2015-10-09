var router = require('express').Router();
var logger = require('logger');
var Person = require('model/person');
var db = require('db');

router.post('/meeting', function (req, res) {
    logger.debug('POST /meeting', req.url);

    // TODO: Validate settings!
    var settings = req.body;
    var admin = new Person(settings.name);
    var meeting = db.createMeeting(settings, admin);

    res.cookie('macchiato_' + meeting.id, admin.id, {maxAge: settings.meetingLength * 2 * 60 * 1000});
    res.status(201).send(meeting);
});

router.get('/meeting/:id', function(req, res, next) {
    var meetingId = req.params.id;
    logger.debug('GET /meeting/%s', meetingId);
    var meeting = db.getMeeting(meetingId);
    if (meeting === null) {
        next();
        return;
    }

    res.status(200).render('meeting');
});

router.get('/api/meeting/:id', function(req, res) {
    var meetingId = req.params.id;
    logger.debug('GET /api/meeting/%s', meetingId);
    var meeting = db.getMeeting(meetingId);
    if (meeting === null) {
        res.status(404).send('Meeting ' + meetingId + ' not found');
        return;
    }

    res.status(200).send(meeting);
});

module.exports = router;