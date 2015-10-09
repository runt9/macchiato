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

    function goToNextTopic(meeting) {
        logger.debug('meeting %s moving to next topic', meeting.id);
        // Grab the next topic to discuss. If there's none left, the meeting is done!
        var topic = _.find(meeting.topics, function(t) {
            return t.status === t.STATUS_TO_DISCUSS;
        });

        if (topic === undefined) {
            logger.info('Meeting %s complete', meeting.id);
            meeting.updateStatus(meeting.STATUS_DONE);
            emitToMeeting(meeting.id, 'meetingStatusUpdated', meeting.status);
            return;
        }

        // Alright, next topic. Set it to discussing and update the client.
        topic.updateStatus(topic.STATUS_DISCUSSING);
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

        // Event to update a meeting's status
        client.on('updateMeetingStatus', function (status) {
            var meetingId = client.meetingId;

            logger.debug('meeting %s status %s', meetingId, status);
            var meeting = db.getMeeting(meetingId);
            if (meeting === null) {
                return;
            }

            if (!meeting.isValidStatus(status)) {
                return;
            }

            var topic;
            switch (status) {
                case meeting.STATUS_VOTING_CLOSED:
                    // Voting's closed, sort topics by votes and set the first topic status to discussing.
                    meeting.topics = _.sortBy(meeting.topics, 'votes', ['desc']);
                    if (meeting.topics.length === 0) {
                        logger.error('Voting closed with no topics for meeting %s', meeting.id);
                        return;
                    }

                    // Now that we've sorted the topics, let everyone know that the meeting is in discussion mode now.
                    status = meeting.STATUS_DISCUSSING;
                    topic = meeting.topics[0];
                    topic.updateStatus(topic.STATUS_DISCUSSING);
                    break;

                case meeting.STATUS_DISCUSSING:
                    // First find if we are voting to continue a topic.
                    topic = _.find(meeting.topics, function(t) {
                        return t.status === t.STATUS_DISCUSSING_VOTING;
                    });

                    // If we finished voting on a topic and that topic has positive votes (meaning the majority want
                    // to continue talking), reset it to discussing and go. Otherwise mark it as done.
                    if (topic !== undefined) {
                        // Re-discussing the current topic
                        if (topic.discussingVotes > 0) {
                            topic.updateStatus(topic.STATUS_DISCUSSING);
                            topic.discussingVotes = 0;
                            break;
                        }

                        topic.updateStatus(topic.STATUS_DONE);
                    }

                    goToNextTopic(meeting);
                    break;

                case meeting.STATUS_DISCUSSING_VOTING:
                    // Find our currently discussing topic and mark it as voting.
                    topic = _.find(meeting.topics, function(t) {
                        return t.status === t.STATUS_DISCUSSING;
                    });

                    topic.updateStatus(topic.STATUS_DISCUSSING_VOTING);
                    break;

                default:
                    // Nothing to do here.
                    break;
            }

            emitToMeeting(meetingId, 'topicsUpdated', meeting.topics);
            meeting.updateStatus(status);
            emitToMeeting(meetingId, 'meetingStatusUpdated', status);
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
            // Unanimous decision to stop discussing this topic
            if ((topic.discussingVotes + (meeting.people.length - 1)) === 0) {
                topic.updateStatus(topic.STATUS_DONE);
                goToNextTopic(meeting);
            }

            emitToMeeting(meetingId, 'topicsUpdated', meeting.topics);
        });
        //endregion
    });
};

module.exports = apiSocketController;