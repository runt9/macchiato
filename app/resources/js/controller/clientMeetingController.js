function ClientMeetingController($scope, $modal, $socket, $cookies, $interval, lodash) {
    $scope.me = {};
    $scope.newTopicText = '';
    $scope.currentTopic = {};
    $scope.discussingVoted = '';
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
            return t.status === $scope.TOPIC_STATUS_DISCUSSING || t.status === $scope.MEETING_STATUS_DISCUSSING_VOTING;
        });

        if (topic === undefined) {
            // Our meeting is about to be done, so just wait for the next event to come in and handle that.
            return;
        }

        if (topic.id !== $scope.currentTopic.id) {
            $scope.currentTopic = topic;
            $scope.discussingVoted = '';
            return;
        }

        if (topic.status === $scope.TOPIC_STATUS_DISCUSSING && $scope.currentTopic.status === $scope.TOPIC_STATUS_DISCUSSING_VOTING) {
            $scope.discussingVoted = '';
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
                $scope.me = person;
                return;
            }
        }

        $modal.open({
            templateUrl: 'joinMeetingModal.html',
            backdrop: true,
            size: 'sm',
            controller: function($scope, $modalInstance) {
                $scope.error = null;
                $scope.name = '';

                $scope.submit = function() {
                    $socket.emit('addPerson', {personName: $scope.name});
                    $modalInstance.dismiss(true);
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss(false);
                };
            }
        });
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

        $scope.votesUsed -= 1;
        $socket.emit('topicRemoveVote', topicId);
    };

    $scope.topicAddDiscussingVote = function(topicId) {
        $socket.emit('topicAddDiscussingVote', topicId);
        $scope.discussingVoted = 'positive';
    };

    $scope.topicRemoveDiscussingVote = function(topicId) {
        $socket.emit('topicRemoveDiscussingVote', topicId);
        $scope.discussingVoted = 'negative';
    };

    $socket.on('joinSuccess', function(personId) {
        var expires = new Date(new Date().getTime() + (1000 * 60 * 60 * 2)); // 2 Hours
        $cookies.put('macchiato_' + $scope.meeting.id, personId, {expires: expires});
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