
'use strict';

angular
    .module('calendarApp')
    .controller('loginController', function LoginController($scope, $location, $routeParams, $timeout, authenticationService) {
        $scope.username = '';
        this.password = '';
        $scope.dataLoading = false;
        $scope.timeoutTime = 5000;
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
                },$scope.handleErrorDBCallback);
    };
    
    $scope.handleErrorDBCallback = function(response){
        $scope.handleErrorDB(response.status, response.data); 
    };

    $scope.handleErrorDB = function(status, data){
      if(data !== undefined && 
          data.errorCode !== undefined && 
          data.errorCode === -1) {
        authenticationService.ClearCredentials();
      }
      $scope.dataLoading = false;
      $scope.error = data.error;
      $timeout(function () {  }, $scope.timeoutTime); 
    };

    $scope.removeErrorMessage = function() {
      $scope.error = undefined;
    };

    $scope.removeAdminMessage = function() {
      $scope.messageAdmin = undefined;
    };

    $scope.removeMessage = function() {
      $scope.message = undefined;
    };

});

