function MeetingController($scope, $http, $cookies, $socket) {
    $scope.MEETING_STATUS_TOPICS_OPEN = 'STATUS_TOPICS_OPEN';
    $scope.MEETING_STATUS_VOTING_OPEN = 'STATUS_VOTING_OPEN';
    $scope.MEETING_STATUS_VOTING_CLOSED = 'STATUS_VOTING_CLOSED';
    $scope.MEETING_STATUS_DISCUSSING = 'STATUS_DISCUSSING';
    $scope.MEETING_STATUS_DISCUSSING_VOTING = 'STATUS_DISCUSSING_VOTING';
    $scope.MEETING_STATUS_DONE = 'STATUS_DONE';

    $scope.TOPIC_STATUS_TO_DISCUSS = 'STATUS_TO_DISCUSS';
    $scope.TOPIC_STATUS_DISCUSSING = 'STATUS_DISCUSSING';
    $scope.TOPIC_STATUS_DISCUSSING_VOTING = 'STATUS_DISCUSSING_VOTING';
    $scope.TOPIC_STATUS_DONE = 'STATUS_DONE';

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
    }).error(function(error) {
        $scope.loading = false;
        $scope.error = error;
    });

    $socket.on('peopleUpdated', function(people) {
        $scope.$apply(function() {
            $scope.meeting.people = people;
        })
    });

    $socket.on('topicsUpdated', function(topics) {
        $scope.$apply(function() {
            $scope.meeting.topics = topics;
        });
    });

    $scope.getMeetingCookie = function() {
        return $cookies.get('macchiato_' + $scope.meeting.id);
    };
}

macchiatoControllers.controller('MeetingController', MeetingController);