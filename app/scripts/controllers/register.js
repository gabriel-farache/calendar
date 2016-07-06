'use strict';
 
 angular
    .module('calendarApp')
    .controller('registerController',   
function RegisterController($scope, $timeout, databaseService, authenticationService, $location) {
    this.username = '';
    this.password = '';
    this.email = '';
    this.adminToken = '';
    $scope.dataLoading = false;
    $scope.error = undefined;
    $scope.timeoutTime = 5000;
    this.initRegisterCtrl = function() {

    };
    this.register = function() {
        $scope.dataLoading = true;
        databaseService.register(this.email, this.username, 
            authenticationService.encodeDecode.encode(this.password), this.adminToken)
            .then(function () {
                    $location.path('/loginout/login');
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


