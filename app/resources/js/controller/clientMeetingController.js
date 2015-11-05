function ClientMeetingController($scope, $modal, $socket, $cookies, $interval, lodash) {
    $scope.newTopicText = '';
    $scope.currentTopic = {};
    $scope.discussingVoted = null;
    $scope.votesUsed = 0;

    // Run our init function once the parent scope has finished loading the meeting data
    $scope.waitForLoadedInterval = $interval(function() {
        if ($scope.loading) {
            return false;
        }

        $interval.cancel($scope.waitForLoadedInterval);
        $scope.init();
    }, 100);

    $scope.setCurrentTopic = function() {
        var topic = lodash.find($scope.meeting.topics, function (t) {
            return t.status === $scope.TOPIC_STATUS_DISCUSSING || t.status === $scope.TOPIC_STATUS_DISCUSSING_VOTING;
        });

        if (topic === undefined) {
            // Our meeting is about to be done, so just wait for the next event to come in and handle that.
            return;
        }

        if (topic.id !== $scope.currentTopic.id) {
            $scope.currentTopic = topic;
            $scope.discussingVoted = null;
            return;
        }

        if (topic.status === $scope.TOPIC_STATUS_DISCUSSING && $scope.currentTopic.status === $scope.TOPIC_STATUS_DISCUSSING_VOTING) {
            $scope.currentTopic.status = $scope.TOPIC_STATUS_DISCUSSING;
            $scope.discussingVoted = null;
            return;
        }

        $scope.currentTopic = topic;
    };

    $scope.init = function () {
        if ($scope.meeting.status === $scope.MEETING_STATUS_DISCUSSING || $scope.meeting.status === $scope.MEETING_STATUS_DISCUSSING_VOTING) {
            $scope.setCurrentTopic();
        }

        // If we've already joined this meeting, "re-join" instead of joining anew.
        var cookie = $scope.getMeetingCookie();
        if (cookie) {
            var person = lodash.find($scope.meeting.people, function(person) {
                return person.id === cookie;
            });

            if (person) {
                var votesUsed = lodash.reduce(person.votes, function(result, n) {
                    return result + n;
                });

                $scope.votesUsed = votesUsed === undefined ? 0 : votesUsed;

                var discussingVotes = $scope.currentTopic.discussingVotes;
                if (!lodash.isEmpty($scope.currentTopic) && discussingVotes.hasOwnProperty(person.id)) {
                    $scope.discussingVoted = discussingVotes[person.id];
                }

                $socket.emit('setClientPerson', person.id);

                return;
            }
        }

        $modal.open({
            templateUrl: 'joinMeetingModal.html',
            backdrop: 'static',
            keyboard: false,
            size: 'sm',
            controller: function($scope, $modalInstance) {
                $scope.error = null;
                $scope.name = '';

                $scope.submit = function() {
                    if ($scope.name.length === 0) {
                        $scope.error = 'Please enter a name';
                        return;
                    }

                    $socket.emit('addPerson', {personName: $scope.name});
                    $modalInstance.dismiss(true);
                };
            }
        });
    };

    $scope.canRemoveTopicVote = function(topicId) {
        var self = $scope.getSelf();
        // Cannot remove votes from a topic we have not voted on.
        return self.votes.hasOwnProperty(topicId) && self.votes[topicId] > 0;
    };

    $scope.addTopic = function() {
        if ($scope.newTopicText.length > 100) {
            $scope.$parent.error = 'Please keep topics under 100 characters!';
            return;
        }

        if ($scope.newTopicText.length === 0) {
            $scope.$parent.error = 'Please enter a topic!';
            return;
        }

        $scope.$parent.error = '';

        $socket.emit('addTopic', {text: $scope.newTopicText});
        $scope.newTopicText = '';
    };

    $scope.removeTopic = function(topicId) {
        $socket.emit('removeTopic', topicId);
    };
    
    $scope.topicAddVote = function(topicId) {
        if ($scope.meeting.settings.votesPerPerson - $scope.votesUsed === 0) {
            return;
        }

        $scope.votesUsed += 1;
        $socket.emit('topicAddVote', topicId);
    };

    $scope.topicRemoveVote = function(topicId) {
        if ($scope.votesUsed === 0) {
            return;
        }

        if (!$scope.canRemoveTopicVote(topicId)) {
            return;
        }

        $scope.votesUsed -= 1;
        $socket.emit('topicRemoveVote', topicId);
    };

    $scope.topicAddDiscussingVote = function(topicId) {
        $socket.emit('topicAddDiscussingVote', topicId);
        $scope.discussingVoted = true;
    };

    $scope.topicRemoveDiscussingVote = function(topicId) {
        $socket.emit('topicRemoveDiscussingVote', topicId);
        $scope.discussingVoted = false;
    };

    $socket.on('joinSuccess', function(personId) {
        var expires = new Date(new Date().getTime() + (1000 * 60 * 60 * 2)); // 2 Hours
        $cookies.put('macchiato_' + $scope.meeting.id, personId, {expires: expires});
        $socket.emit('setClientPerson', personId);
    });

    $socket.on('personPromoted', function(personId) {
        if (personId === $scope.getMeetingCookie()) {
            location.reload();
            return;
        }

        $scope.$apply(function() {
            $scope.meeting.admin = personId;
        });
    });

    $socket.on('meetingStatusUpdated', function(status) {
        $scope.$apply(function() {
            $scope.meeting.status = status;

            if (status === $scope.MEETING_STATUS_DISCUSSING || $scope.meeting.status === $scope.MEETING_STATUS_DISCUSSING_VOTING) {
                $scope.setCurrentTopic();
            }
        });
    });

    $socket.on('topicsUpdated', function(topics) {
        $scope.$apply(function() {
            $scope.meeting.topics = topics;
            $scope.setCurrentTopic();
        });
    });
}

macchiatoControllers.controller('ClientMeetingController', ClientMeetingController);
