'use strict';
 
 angular
    .module('calendarApp')
    .controller('registerController',  ['$scope', '$timeout', 'databaseService', 'authenticationService', '$location', 'globalizationService', 
function RegisterController($scope, $timeout, databaseService, authenticationService, $location, globalizationService) {
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
        var encodedPassword = authenticationService.encodeDecode.encode(this.password);
        if(encodedPassword !== undefined){
          databaseService.register(this.email, this.username, encodedPassword, this.adminToken)
              .then(function () {
                      $location.path('/loginout/login');
          },$scope.handleErrorDBCallback);
        } else {
          $scope.error = globalizationService.getLocalizedString('LOGIN_ENCODE_PASSWORD_ERROR_MSG');
          $timeout($scope.removeErrorMessage, $scope.timeoutTime); 
        }
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
      $timeout($scope.removeErrorMessage, $scope.timeoutTime); 
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
}]);


