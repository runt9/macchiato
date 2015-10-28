function AdminMeetingController($scope, $socket, $interval, lodash) {
    $scope.currentTopic = null;

    // Run our init function once the parent scope has finished loading the meeting data
    $scope.waitForLoadedInterval = $interval(function() {
        if ($scope.loading) {
            return false;
        }

        $interval.cancel($scope.waitForLoadedInterval);
        $scope.init();
    }, 100);

    $scope.init = function() {
        $scope.timer.time = $scope.meeting.settings['timePerTopic'];
    };

    $scope.personNameEllipses = function(name) {
        return name.length > 11 ? name.substr(0, 12) + '...' : name;
    };

    $scope.isPersonAdmin = function(person) {
        return person.id === $scope.meeting.admin;
    };

    $scope.kickPerson = function(person) {
        $socket.emit('removePerson', person.id);
    };

    $scope.promotePerson = function(person) {
        $socket.emit('promotePerson', person.id);
    };

    $scope.openVoting = function() {
        $socket.emit('updateMeetingStatus', $scope.MEETING_STATUS_VOTING_OPEN);
    };

    $scope.closeVoting = function() {
        $socket.emit('updateMeetingStatus', $scope.MEETING_STATUS_VOTING_CLOSED);
    };

    $socket.on('personPromoted', function() {
        location.reload();
    });

    $scope.isDiscussing = function(topic) {
        return topic.status === $scope.TOPIC_STATUS_DISCUSSING || topic.status === $scope.TOPIC_STATUS_DISCUSSING_VOTING;
    };

    $socket.on('meetingStatusUpdated', function(status) {
        $scope.$apply(function() {
            $scope.meeting.status = status;

            if (status === $scope.MEETING_STATUS_DISCUSSING) {
                var topic = lodash.find($scope.meeting.topics, function (t) {
                    return t.status === $scope.TOPIC_STATUS_DISCUSSING;
                });

                if (topic === undefined) {
                    // Our meeting is about to be done, so just wait for the next event to come in and handle that.
                    return;
                }

                // Don't have a current topic yet, so set it.
                if ($scope.currentTopic === null) {
                    $scope.currentTopic = topic;
                    $scope.timer.time = $scope.meeting.settings['timePerTopic'];
                } else {
                    // We're re-discussing the current topic. Set the timer to the time after voting time and go.
                    if ($scope.currentTopic.id === topic.id) {
                        $scope.timer.time = $scope.meeting.settings['timePerTopicAfterVoting'];
                    } else {
                        $scope.currentTopic = topic;
                        $scope.timer.time = $scope.meeting.settings['timePerTopic'];
                    }
                }

                $scope.timer.playing = true;
            }
        });
    });

    $scope.timer = {
        time: 0,
        playing: false,

        updateTimer: function() {
            if ($scope.timer.playing) {
                if ($scope.timer.time > 0) {
                    $scope.timer.time--;
                    if ($scope.timer.time === 0) {
                        $socket.emit('updateMeetingStatus', $scope.MEETING_STATUS_DISCUSSING_VOTING);
                        $scope.timer.playing = false;
                    }
                }
            }
        },

        formatTime: function() {
            var time = $scope.timer.time;

            var minutes = Math.floor(time / 60);
            var seconds = Math.floor(time - (minutes * 60));
            if (seconds < 10) {
                seconds = '0' + seconds;
            }

            return minutes + ':' + seconds;
        },

        toggle: function() {
            $scope.timer.playing = !$scope.timer.playing;
        }
    };
}

macchiatoControllers.controller('AdminMeetingController', AdminMeetingController);