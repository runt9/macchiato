var router = require('express').Router();
var logger = require('logger');
var Person = require('model/person');
var db = require('db');

//region Helper Functions
function getMeeting(meetingId, res, callback) {
    var meeting = db.getMeeting(meetingId);
    if (meeting === null) {
        logger.error('Failed to lookup meeting %s', meetingId);
        res.status(404).send('Failed to find meeting ' + meetingId);
        return;
    }

    callback(meeting);
}

function getTopic(meeting, topicId, res, callback) {
    var topic = meeting.getTopic(topicId);
    if (topic === null) {
        logger.error('Failed to lookup meeting %s topic %s', meeting.id, topicId);
        res.status(404).send('Failed to find topic ' + topicId);
        return;
    }

    callback(topic);
}
//endregion

//region Meeting management
// Endpoint to create a new meeting
router.post('/api/meeting', function (req, res) {
    logger.debug('meeting [%s]', req.url);

    // TODO: Validate settings!
    var settings = req.body;
    var admin = new Person(settings.name);
    var meeting = db.createMeeting(settings, admin);

    res.cookie('macchiato-' + meeting.id, admin.id,
        {path: '/api/meeting', secure: true, maxAge: settings.meetingLength * 2 * 60 * 1000});
    res.status(201).send(meeting);
});

// Endpoint to get an existing meeting by id and return its data
router.get('/api/meeting/:id', function (req, res) {
    var meetingId = req.params.id;

    logger.debug('meeting %s', meetingId);
    getMeeting(meetingId, res, function (meeting) {
        res.status(200).send(meeting);
    });
});
//endregion

//region Person Management
// Endpoint for a person to join a meeting
router.post('/api/meeting/:id/person/', function (req, res) {
    var meetingId = req.params.id;
    // TODO: Validate person data!
    var personName = req.body.name;

    logger.debug('meeting %s person join %s', meetingId, personName);
    getMeeting(meetingId, res, function (meeting) {
        var person = meeting.personJoin(personName);
        res.status(201).send(person);
    });
});

// Endpoint to remove a person from a meeting
router.delete('/api/meeting/:id/person/:pid', function (req, res) {
    var meetingId = req.params.id;
    var personId = req.params.pid;

    logger.debug('meeting %s person remove %s', meetingId, personId);
    getMeeting(meetingId, res, function (meeting) {
        var success = meeting.personRemove(personId);
        if (success) {
            res.status(204).end();
            return;
        }

        logger.error('Failed to delete person %s', personId);
        res.status(404).send('Failed to delete person ' + personId);
    });
});
//endregion

//region Topic Management
// Endpoint to add a topic to a meeting
router.post('/api/meeting/:id/topic/', function (req, res) {
    var meetingId = req.params.id;
    // TODO: Validate topic data!
    var topicText = req.body.text;

    logger.debug('meeting %s new topic %s', meetingId, topicText);
    getMeeting(meetingId, res, function (meeting) {
        var topic = meeting.addTopic(topicText);
        res.status(201).send(topic);
    });
});

// Endpoint to remove a topic from a meeting
router.delete('/api/meeting/:id/topic/:tid', function (req, res) {
    var meetingId = req.params.id;
    var topicId = req.params.tid;

    logger.debug('meeting %s topic remove %s', meetingId, topicId);
    getMeeting(meetingId, res, function (meeting) {
        var success = meeting.topicRemove(topicId);
        if (success) {
            res.status(204).end();
            return;
        }

        logger.error('Failed to delete topic %s', topicId);
        res.status(404).send('Failed to delete topic ' + topicId);
    });
});

// Endpoint to update a topic status
router.patch('/api/meeting/:id/topic/:tid/status', function (req, res) {
    var meetingId = req.params.id;
    var topicId = req.params.tid;
    var topicStatus = req.body.status;

    logger.debug('meeting %s topic %s status %s', meetingId, topicId, topicStatus);
    getMeeting(meetingId, res, function (meeting) {
        getTopic(meeting, topicId, res, function(topic) {
            if (!topic.isValidStatus(topicStatus)) {
                res.status(400).send('Invalid status ' + topicStatus);
                return;
            }

            topic.updateStatus(topicStatus);
            res.status(204).end();
        });
    });
});

// Endpoint to add a vote to a topic
router.get('/api/meeting/:id/topic/:tid/addVote', function (req, res) {
    var meetingId = req.params.id;
    var topicId = req.params.tid;

    logger.debug('meeting %s topic %s add vote', meetingId, topicId);
    getMeeting(meetingId, res, function (meeting) {
        getTopic(meeting, topicId, res, function(topic) {
            topic.addVote();
            res.status(204).end();
        });
    });
});

// Endpoint to remove a vote from a topic
router.get('/api/meeting/:id/topic/:tid/removeVote', function (req, res) {
    var meetingId = req.params.id;
    var topicId = req.params.tid;

    logger.debug('meeting %s topic %s remove vote', meetingId, topicId);
    getMeeting(meetingId, res, function (meeting) {
        getTopic(meeting, topicId, res, function(topic) {
            topic.removeVote();
            res.status(204).end();
        });
    });
});

// Endpoint to add a discussing vote to a topic
router.get('/api/meeting/:id/topic/:tid/addDiscussingVote', function (req, res) {
    var meetingId = req.params.id;
    var topicId = req.params.tid;

    logger.debug('meeting %s topic %s add discussing vote', meetingId, topicId);
    getMeeting(meetingId, res, function (meeting) {
        getTopic(meeting, topicId, res, function(topic) {
            topic.addDiscussingVote();
            res.status(204).end();
        });
    });
});

// Endpoint to remove a discussing vote from a topic
router.get('/api/meeting/:id/topic/:tid/removeDiscussingVote', function (req, res) {
    var meetingId = req.params.id;
    var topicId = req.params.tid;

    logger.debug('meeting %s topic %s remove discussing vote', meetingId, topicId);
    getMeeting(meetingId, res, function (meeting) {
        getTopic(meeting, topicId, res, function(topic) {
            topic.removeDiscussingVote();
            res.status(204).end();
        });
    });
});
//endregion

module.exports = router;