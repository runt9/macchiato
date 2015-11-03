function MeetingController($scope, $http, $cookies, $socket, lodash) {
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
    $scope.isLeaving = false;
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
        });
    });

    $socket.on('topicsUpdated', function(topics) {
        $scope.$apply(function() {
            $scope.meeting.topics = topics;
        });
    });

    $scope.promotePerson = function(person) {
        $socket.emit('promotePerson', person.id);
    };

    $scope.removePerson = function(person) {
        $socket.emit('removePerson', person.id);
    };

    $scope.getMeetingCookie = function() {
        return $cookies.get('macchiato_' + $scope.meeting.id);
    };

    $scope.getSelf = function() {
        var cookie = $scope.getMeetingCookie();
        return lodash.find($scope.meeting.people, function (p) {
            return p.id === cookie;
        });
    };

    $scope.dotVotes = function(topic) {
        var retval = '';
        for (var i = 0; i < topic.votes; i++) {
            retval += '.';
        }
        return retval;
    };

    $scope.leaveMeeting = function() {
        $scope.isLeaving = true;
        // If we're the admin, we want to promote someone else in the meeting before we go so that
        // we don't drop off with no admin. If there's no one to promote, who cares, just leave.
        if ($scope.isAdmin) {
            var people = $scope.meeting.people;
            if (people.length > 1) {
                var person = lodash.find(people, function(p) {
                    return p.id !== $scope.meeting.admin;
                });

                $scope.promotePerson(person);
            }
        }

        $scope.removePerson($scope.getSelf());
        $cookies.remove('macchiato_' + $scope.meeting.id);
        window.location = '/';
    };
}

macchiatoControllers.controller('MeetingController', MeetingController);