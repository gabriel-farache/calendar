'use strict';

angular
    .module('calendarApp')
    .controller('headerController', ['$scope', '$cookies', '$location', 'sharedService', 'authenticationService', 'globalizationService',
    function HeaderController($scope, $cookies, $location, sharedService, authenticationService, globalizationService) {
        $scope.guestName = 'Visiteur';
        $scope.username = $scope.guestName;
        $scope.isAdmin = false;
        $scope.isLoaded = globalizationService.isLoaded;
        $scope.userEmail = undefined;

    	var globalsCookies = $cookies.getObject('globals');
      	if(globalsCookies !== undefined) {
        	$scope.isAdmin = globalsCookies.isAdmin;
        	$scope.username = globalsCookies.username;
            $scope.userEmail = globalsCookies.userEmail;
        }

        if(($scope.userEmail === undefined || $scope.userEmail === '')&&
            $scope.guestName !== $scope.username) {
            $location.path('/userConsole');
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
            $scope.userEmail = message.userEmail;
        }

        function handleI18nLoadedFunction() {
            $scope.isLoaded = true;
        }

        $scope.$on('handleBroadcast', handleBroadcastCallbackFunction);

        $scope.$on('i18nLoaded', handleI18nLoadedFunction);


    }]);