function ClientMeetingController($scope, $modal, $socket, $cookies, $interval, lodash) {
    $scope.me = {};

    // Run our init function once the parent scope has finished loading the meeting data
    $scope.waitForLoadedInterval = $interval(function() {
        if ($scope.loading) {
            return false;
        }

        $interval.cancel($scope.waitForLoadedInterval);
        $scope.init();
    }, 100);

    $scope.init = function () {
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

    $socket.on('joinSuccess', function(personId) {
        var expires = new Date(new Date().getTime() + (1000 * 60 * 60 * 2)); // 2 Hours
        $cookies.put('macchiato_' + $scope.meeting.id, personId, {expires: expires});
    });

    $socket.on('personPromoted', function(personId) {
        if (personId === $scope.getMeetingCookie()) {
            location.reload();
            return;
        }

        $scope.meeting.admin = personId;
    });
}

macchiatoControllers.controller('ClientMeetingController', ClientMeetingController);