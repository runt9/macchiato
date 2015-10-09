function MeetingController($scope, $http, $cookies, $socket) {
    $scope.error = null;
    $scope.loading = true;
    $scope.isAdmin = false;
    $scope.meeting = {};

    $http.get('/api/meeting/' + window.location.pathname.split('/').pop()).success(function(meeting) {
        $scope.loading = false;
        $scope.meeting = meeting;
        if (meeting.admin === $cookies.get('macchiato_' + meeting.id)) {
            $scope.isAdmin = true;
        }

        $socket.emit('meetingConnected', meeting.id);
        $scope.timer.time = meeting.settings['timePerTopic'];
    }).error(function(error) {
        $scope.loading = false;
        $scope.error = error;
    });

    $scope.timer = {
        time: 0,
        playing: false,

        updateTimer: function() {
            if ($scope.timer.playing && $scope.timer.time > 0) {
                $scope.timer.time--;
            }
        },

        formatTime: function() {
            var time = $scope.timer.time;

            var minutes = Math.floor(time / 60);
            var seconds = Math.floor(time - (minutes * 60));
            if (seconds < 10) {
                seconds = "0" + seconds;
            }

            return minutes + ":" + seconds;
        },

        toggle: function() {
            $scope.timer.playing = !$scope.timer.playing;
        }
    };

    $socket.on('peopleUpdated', function(people) {
        $scope.meeting.people = people;
    });

    $socket.on('topicsUpdated', function(topics) {
        $scope.meeting.topics = topics;
    });

    $scope.getMeetingCookie = function() {
        return $cookies.get('macchiato_' + $scope.meeting.id);
    };
}

macchiatoControllers.controller('MeetingController', MeetingController);