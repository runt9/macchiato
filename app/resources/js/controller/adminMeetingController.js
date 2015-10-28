function AdminMeetingController($scope, $socket, $interval, lodash) {
    $scope.currentTopic = null;
    $scope.settingTimer = false;
    $scope.newTimerTime = '';

    // Run our init function once the parent scope has finished loading the meeting data
    $scope.waitForLoadedInterval = $interval(function() {
        if ($scope.loading) {
            return false;
        }

        $interval.cancel($scope.waitForLoadedInterval);
        $scope.init();
    }, 100);

    $scope.init = function() {
        $scope.timer.timePerTopic = $scope.meeting.settings['timePerTopic'] * 60;
        $scope.timer.timePerTopicAfterVote = $scope.meeting.settings['timePerTopicAfterVote'] * 60;
        $scope.timer.time = $scope.timer.timePerTopic;

        $interval($scope.timer.updateTimer, 1000);
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
                    $scope.timer.time = $scope.timer.timePerTopic;
                } else {
                    // We're re-discussing the current topic. Set the timer to the time after voting time and go.
                    if ($scope.currentTopic.id === topic.id) {
                        $scope.timer.time = $scope.timer.timePerTopicAfterVote;
                    } else {
                        $scope.currentTopic = topic;
                        $scope.timer.time = $scope.timer.timePerTopic;
                    }
                }

                $scope.timer.playing = true;
            }
        });
    });

    $scope.timer = {
        time: 0,
        timePerTopic: 0,
        timePerTopicAfterVoting: 0,
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

        timeToSeconds: function(timeStr) {
            var timeChunks = timeStr.split(':');
            return parseInt(timeChunks[1]) + (parseInt(timeChunks[0]) * 60);
        },

        toggle: function() {
            $scope.timer.playing = !$scope.timer.playing;
        },

        reset: function() {
            $scope.timer.time = $scope.timer.timePerTopic;
        },

        setCustomTime: function(time) {
            if (!time.match(/^[0-9]+:[0-9]{2}$/)) {
                $scope.customTimeError = 'Invalid time specified. Please specify in format MM:SS';
                return;
            }

            $scope.timer.time = $scope.timer.timeToSeconds(time);
            $scope.settingTimer = false;
            $scope.newTimerTime = '';
            $scope.customTimeError = '';
        }
    };
}

macchiatoControllers.controller('AdminMeetingController', AdminMeetingController);