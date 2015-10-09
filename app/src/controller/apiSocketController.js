var logger = require('logger');
var db = require('db');
var _ = require('lodash');
var utility = require('utility');

var apiSocketController = function (socket) {
    var clients = [];

    function emitToMeeting(meetingId, event, data) {
        _.each(clients, function (client) {
            if (client.meetingId === meetingId) {
                client.emit(event, data);
            }
        });
    }

    socket.on('connection', function (client) {
        logger.debug('New connection');

        client.on('disconnect', function () {
            logger.debug('Client %s disconnected', client.clientGuid);
            _.remove(clients, function (c) {
                return c.clientGuid === client.clientGuid;
            });

            client.connected = false;
        });

        // Simple event to save off a client as being connected to a meeting and set a GUID to find it later.
        client.on('meetingConnected', function (meetingId) {
            // Client is already connected
            if (client.hasOwnProperty('meetingId')) {
                return;
            }

            if (db.getMeeting(meetingId) === null) {
                logger.error('Client attempted to connect to unknown meeting %s', meetingId);
                return;
            }

            var clientGuid = utility.generateGuid('socketClient');
            logger.debug('Client %s connected to meeting %s', clientGuid, meetingId);
            client['meetingId'] = meetingId;
            client['clientGuid'] = clientGuid;
            client.connected = true;
            clients.push(client);
        });

        //region Person Management
        // Event for a person to join a meeting
        client.on('addPerson', function (data) {
            var meetingId = client.meetingId;
            // TODO: Validate person data!
            var personName = data.personName;

            logger.debug('meeting %s person join %s', meetingId, personName);
            var meeting = db.getMeeting(meetingId);
            if (meeting === null) {
                return;
            }

            var person = meeting.personJoin(personName);
            client.emit('joinSuccess', person.id);
            emitToMeeting(meetingId, 'peopleUpdated', meeting.people);
        });

        // Event to remove a person from a meeting
        client.on('removePerson', function (personId) {
            var meetingId = client.meetingId;

            logger.debug('meeting %s person remove %s', meetingId, personId);
            var meeting = db.getMeeting(meetingId);
            if (meeting === null) {
                return;
            }

            var success = meeting.personRemove(personId);
            if (success) {
                emitToMeeting(meetingId, 'peopleUpdated', meeting.people);
                return;
            }

            logger.error('Failed to delete person %s', personId);
        });

        // Event to promote a person to admin
        client.on('promotePerson', function (personId) {
            var meetingId = client.meetingId;

            logger.debug('meeting %s person promote %s', meetingId, personId);
            var meeting = db.getMeeting(meetingId);
            if (meeting === null) {
                return;
            }

            var success = meeting.personPromote(personId);
            if (success) {
                emitToMeeting(meetingId, 'personPromoted', personId);
                return;
            }

            logger.error('Failed to promote person %s', personId);
        });
        //endregion

        //region Topic Management
        // Event to add a topic to a meeting
        client.on('addTopic', function (data) {
            var meetingId = client.meetingId;
            // TODO: Validate topic data!
            var topicText = data.text;

            logger.debug('meeting %s new topic %s', meetingId, topicText);
            var meeting = db.getMeeting(meetingId);
            if (meeting === null) {
                return;
            }

            meeting.addTopic(topicText);
            emitToMeeting(meetingId, 'topicsUpdated', meeting.topics);
        });

        // Event to remove a topic from a meeting
        client.on('removeTopic', function (topicId) {
            var meetingId = client.meetingId;

            logger.debug('meeting %s topic remove %s', meetingId, topicId);
            var meeting = db.getMeeting(meetingId);
            if (meeting === null) {
                return;
            }

            var success = meeting.topicRemove(topicId);
            if (success) {
                emitToMeeting(meetingId, 'topicsUpdated', meeting.topics);
                return;
            }

            logger.error('Failed to delete topic %s', topicId);
        });

        // Event to update a topic status
        client.on('updateTopicStatus', function (data) {
            var meetingId = client.meetingId;
            var topicId = data.topicId;
            var topicStatus = data.topicStatus;

            logger.debug('meeting %s topic %s status %s', meetingId, topicId, topicStatus);
            var meeting = db.getMeeting(meetingId);
            if (meeting === null) {
                return;
            }

            var topic = meeting.getTopic(topicId);
            if (topic === null) {
                return;
            }

            if (!topic.isValidStatus(topicStatus)) {
                return;
            }

            topic.updateStatus(topicStatus);
            emitToMeeting(meetingId, 'topicsUpdated', meeting.topics);
        });

        // Event to add a vote to a topic
        client.on('topicAddVote', function (topicId) {
            var meetingId = client.meetingId;

            logger.debug('meeting %s topic %s add vote', meetingId, topicId);
            var meeting = db.getMeeting(meetingId);
            if (meeting === null) {
                return;
            }

            var topic = meeting.getTopic(topicId);
            if (topic === null) {
                return;
            }

            topic.addVote();
            emitToMeeting(meetingId, 'topicsUpdated', meeting.topics);
        });

        // Event to remove a vote to a topic
        client.on('topicRemoveVote', function (topicId) {
            var meetingId = client.meetingId;

            logger.debug('meeting %s topic %s remove vote', meetingId, topicId);
            var meeting = db.getMeeting(meetingId);
            if (meeting === null) {
                return;
            }

            var topic = meeting.getTopic(topicId);
            if (topic === null) {
                return;
            }

            topic.removeVote();
            emitToMeeting(meetingId, 'topicsUpdated', meeting.topics);
        });

        // Event to add a discussing vote to a topic
        client.on('topicAddDiscussingVote', function (topicId) {
            var meetingId = client.meetingId;

            logger.debug('meeting %s topic %s add discussing vote', meetingId, topicId);
            var meeting = db.getMeeting(meetingId);
            if (meeting === null) {
                return;
            }

            var topic = meeting.getTopic(topicId);
            if (topic === null) {
                return;
            }

            topic.addDiscussingVote();
            emitToMeeting(meetingId, 'topicsUpdated', meeting.topics);
        });

        // Event to remove a discussing vote to a topic
        client.on('topicRemoveDiscussingVote', function (topicId) {
            var meetingId = client.meetingId;

            logger.debug('meeting %s topic %s remove discussing vote', meetingId, topicId);
            var meeting = db.getMeeting(meetingId);
            if (meeting === null) {
                return;
            }

            var topic = meeting.getTopic(topicId);
            if (topic === null) {
                return;
            }

            topic.removeDiscussingVote();
            emitToMeeting(meetingId, 'topicsUpdated', meeting.topics);
        });
        //endregion
    });
};

module.exports = apiSocketController;