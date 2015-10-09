function MeetingController($scope, $http, $cookies) {
    $scope.error = null;
    $scope.loading = true;
    $scope.isAdmin = false;
    $scope.meeting = {};

    $http.get('/api/meeting/' + window.location.pathname.split('/').pop()).success(function(meeting) {
        $scope.loading = false;
        $scope.meeting = meeting;
        if (meeting.admin.id === $cookies.get('macchiato_' + meeting.id)) {
            $scope.isAdmin = true;
        }
    }).error(function(error) {
        $scope.loading = false;
        $scope.error = error;
    });
}

macchiatoControllers.controller('MeetingController', MeetingController);