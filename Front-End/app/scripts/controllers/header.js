'use strict';

angular
    .module('calendarApp')
    .controller('headerController', ['$scope', '$cookieStore', '$location', 'sharedService', 'authenticationService', 'globalizationService',
    function HeaderController($scope, $cookieStore, $location, sharedService, authenticationService, globalizationService) {
        $scope.guestName = 'Visiteur';
        $scope.username = $scope.guestName;
        $scope.isAdmin = false;
        $scope.isLoaded = globalizationService.isLoaded;

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

        function handleI18nLoadedFunction() {
            $scope.isLoaded = true;
        }

        $scope.$on('handleBroadcast', handleBroadcastCallbackFunction);

        $scope.$on('i18nLoaded', handleI18nLoadedFunction);


    }]);