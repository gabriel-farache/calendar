'use strict';

angular
    .module('calendarApp')
    .controller('headerController', ['$scope', '$cookieStore', '$location', 'sharedService', 'authenticationService', 
    function HeaderController($scope, $cookieStore, $location, sharedService, authenticationService) {
        $scope.guestName = 'Visiteur';
        $scope.username = $scope.guestName;
        $scope.isAdmin = false;


    	var globalsCookies = $cookieStore.get('globals');
      	if(globalsCookies !== undefined) {
        	$scope.isAdmin = globalsCookies.isAdmin;
        	$scope.username = globalsCookies.username;
        }

        this.logout = function() {
			authenticationService.ClearCredentials();
			$scope.username = undefined;
	        $scope.isAdmin = false;
            $location.path('/');
        };

        function handleBroadcastCallbackFunction() {
            var message = sharedService.message;
            $scope.username = message.username;
            $scope.username = $scope.username === undefined ? $scope.guestName : $scope.username;
            $scope.isAdmin = message.isAdmin;
        }

        $scope.$on('handleBroadcast', handleBroadcastCallbackFunction);


    }]);