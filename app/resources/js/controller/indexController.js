function IndexController($scope, $http, $modal) {
    $scope.newMeeting = function() {
        $modal.open({
            templateUrl: 'newMeetingModal.html',
            backdrop: true,
            size: 'sm',
            controller: function($scope, $modalInstance) {
                $scope.loading = false;
                $scope.error = null;
                $scope.name = '';
                $scope.meetingLength = 4;
                $scope.timePerTopic = 2;
                $scope.timePerTopicAfterVote = 2;
                $scope.votesPerPerson = 3;
                
                $scope.submit = function() {
                    $scope.loading = true;
                    
                    var postData = {
                        name: $scope.name,
                        meetingLength: $scope.meetingLength,
                        timePerTopic: $scope.timePerTopic,
                        timePerTopicAfterVote: $scope.timePerTopicAfterVote,
                        votesPerPerson: $scope.votesPerPerson
                    };
                    $http.post('/meeting', postData).success(function(meeting) {
                        $scope.loading = false;
                        window.location.href = '/meeting/' + meeting.id;
                    }).error(function(error) {
                        $scope.loading = false;
                        $scope.error = error;
                    });
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss(false);
                };
            }
        });
    };
}

macchiatoControllers.controller('IndexController', IndexController);