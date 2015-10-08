var router = require('express').Router();
var logger = require('logger');
var Person = require('model/person');
var db = require('db');

router.get('/', function (req, res) {
    logger.debug('index [%s]', req.url);
    res.status(200).render('index');
});

router.post('/meeting', function (req, res) {
    logger.debug('meeting [%s]', req.url);

    // TODO: Validate settings!
    var settings = req.body;
    var admin = new Person(settings.name);
    var meeting = db.createMeeting(settings, admin);

    res.cookie('macchiato-' + meeting.id, admin.id,
        {path: '/meeting/' + meeting.id, secure: true, maxAge: settings.meetingLength * 2 * 60 * 1000});
    res.status(201).send(meeting);
});

module.exports = router;