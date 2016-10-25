trendOMeterApp.controller('DuelsController', function($scope,UserService, DuelService, $location) {
    $scope.loading = true; 
    $scope.duels = [];
    $scope.currentDuel = null;
    $scope.totalDuels = 12;
    $scope.error = false;
    $scope.saving = false;

    function init() {
        var user_id = UserService.getLoggedID();
        if(!user_id){
            $location.path('/start');
            return;
        }
        DuelService.createDuels(user_id).then(function(response) {
            $scope.duels = response.data;
            $scope.loading = false;
        });
    }

    $scope.getCurrentDuel = function() {
        $scope.currentDuel = $scope.duels.shift();
        $scope.finish();
    };

    $scope.finish = function() {
        $location.path('/finish');
    };

    $scope.getCurrentPage = function() {
        return $scope.totalDuels - $scope.duels.length;
    };

    $scope.saveAction = function(promise) {
        $scope.saving = true;
        promise.then(function(response) {
            if(response.status == 204) {
                $scope.error = false;
                $scope.getCurrentDuel();
            } else {
                $scope.error = true;
            }
            $scope.saving = false;
        });
    }

    init();

});