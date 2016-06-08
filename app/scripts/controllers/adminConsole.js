
'use strict';
angular.module('calendarApp')
  .controller('adminConsoleController', function ($scope, $cookieStore, databaseService) {
        $scope.adminToken = '';
        $scope.adminTokenEndTime = '';
    
        this.generateAdminToken = function() {
            $scope.error = undefined;
            $scope.dataLoading = true;
            var globalsCookies = $cookieStore.get('globals');
            if(globalsCookies !== undefined) {
                databaseService.generateAdminToken(globalsCookies.token).
                then(function (response) {
                        var data = response.data;
                        $scope.adminToken = data.adminToken;
                        $scope.adminTokenEndTime = data.adminTokenEndTime;
                    }, function (response) {
                        $scope.error = response.data.error;
                        console.log(response);
                        $scope.dataLoading = false;
                    }
                );
            } else {
                $scope.error = 'Clef d\'authentification inconnu';
            }
            
        };
});

