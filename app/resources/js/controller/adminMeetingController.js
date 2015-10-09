function AdminMeetingController($scope, $socket, $cookies) {
    $scope.kickPerson = function(person) {
        $socket.send('removePerson', person.id);
    };

    $scope.promotePerson = function(person) {
        $socket.send('promotePerson', person.id);
    };

    $socket.on('personPromoted', function() {
        location.reload();
    });
}

macchiatoControllers.controller('AdminMeetingController', AdminMeetingController);