
'use strict';

angular
    .module('calendarApp')
    .controller('loginController', function LoginController($scope, $location, $routeParams, authenticationService) {
        $scope.username = '';
        this.password = '';
        $scope.dataLoading = false;
        var action = $routeParams.param;
    this.initLoginController = function initController() {
        // reset login status
        if(action === 'logout'){
            authenticationService.ClearCredentials();
            $scope.error = undefined;
            $location.path('/');
        }
    };

    this.login = function() {
        $scope.error = undefined;
        $scope.dataLoading = true;
        var encodedPassword = authenticationService.encodeDecode.encode(this.password);
        authenticationService.Login($scope.username,encodedPassword).
            then(function (response) {
                    var data = response.data;
                    authenticationService.SetCredentials($scope.username, data.token, data.isAdmin);
                    $location.path('/');
                }, function (response) {
                    $scope.error = response.data.error;
                    console.log(response);
                    $scope.dataLoading = false;
                }
            );
    };

});

