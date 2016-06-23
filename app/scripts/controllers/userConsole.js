'use strict';
angular.module('calendarApp')
  .controller('userConsoleController', function ($scope, $cookieStore, $timeout, databaseService, sharedService, authenticationService) {
    $scope.timeoutTime = 10000;
    $scope.isUpdating = false;
    $scope.booker = {};
    $scope.message = undefined;
    $scope.dataLoading = false;

    $scope.$on('handleBroadcast', function() {
        var message = sharedService.message;
        $scope.authToken = message.token;
        $scope.booker.booker = message.username;
    });

    var globalsCookies = $cookieStore.get('globals');
    if(globalsCookies !== undefined) {
        $scope.authToken = globalsCookies.token;
        $scope.booker.oldBooker = globalsCookies.username;
        $scope.booker.booker = globalsCookies.username;
        $scope.isAdmin = globalsCookies.isAdmin;
    }

    this.initUser = function() {
        databaseService.getBookerEmailDB($scope.booker.booker, $scope.authToken).
            then(function(response){
                $scope.booker.email = response.data.email;
                $scope.booker.newPassword = undefined;
            }, function(response) {
                $scope.handleErrorDB(response.status, response.data);
            });
    };

    this.updateBookerSettings = function() {
        $scope.dataLoading = true;
        $scope.booker.password = authenticationService.encodeDecode.encode($scope.booker.password);
        if($scope.booker.newPassword !== undefined) {
            $scope.booker.newPassword = authenticationService.encodeDecode.encode($scope.booker.newPassword);
        }
        databaseService.updateBookerSettingsDB($scope.booker, $scope.authToken).
            then(function() {
                $scope.message = "Paramètres mis à jour.";
                $scope.isUpdating = false;
                $scope.dataLoading = false;
                $scope.booker.newPassword = undefined;
                $scope.booker.password = undefined;
                authenticationService.SetCredentials($scope.booker.booker, $scope.authToken, $scope.isAdmin);
                $timeout(function () { $scope.message = undefined; }, $scope.timeoutTime);
                $scope.initUser();
            }, function(response) {
                $scope.handleErrorDB(response.status, response.data);
            });

    };

    this.enableUpdateSettings = function() {
        $scope.isUpdating = true;
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