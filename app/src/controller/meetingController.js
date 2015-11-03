var router = require('express').Router();
var logger = require('logger');
var Person = require('model/person');
var db = require('db');

router.post('/meeting', function (req, res) {
    logger.debug('POST /meeting');

    // TODO: Validate settings!
    var settings = req.body;
    var admin = new Person(settings.name);
    var meeting = db.createMeeting(settings, admin);

    res.cookie('macchiato_' + meeting.id, admin.id, {maxAge: 1000 * 60 * 60 * 2, path: '/meeting'}); // 2 Hours
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

    var cookieName = 'macchiato_' + meetingId;
    var admin = false;
    if (req.hasOwnProperty('cookies') && Object.prototype.hasOwnProperty.call(req.cookies, cookieName)) {
        if (req.cookies[cookieName] === meeting.admin) {
            admin = true;
        }
    }

    res.status(200).render('meeting', {admin: admin, meeting: true});
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