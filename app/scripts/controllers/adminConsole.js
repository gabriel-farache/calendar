
'use strict';
angular.module('calendarApp')
  .controller('adminConsoleController', function ($scope, $cookieStore, $timeout, databaseService, sharedService, authenticationService) {
        $scope.adminToken = '';
        $scope.adminTokenEndTime = '';
        $scope.error = undefined;
        $scope.rooms=[];
        $scope.timeoutTime = 5000;
        
        $scope.$on('handleBroadcast', function() {
            var message = sharedService.message;
            $scope.authToken = message.token;
        });

        var globalsCookies = $cookieStore.get('globals');
        if(globalsCookies !== undefined) {
            $scope.authToken = globalsCookies.token;
        }

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
                        $scope.handleErrorDB(response.status, response.data);
                    }
                );
            } else {
                $scope.error = 'Clef d\'authentification inconnu';
                $timeout(function () { $scope.error = undefined; }, $scope.timeoutTime); 
            }
            
        };

        $scope.initRooms = function() {
            $scope.rooms=[];
            databaseService.getRoomsDB().then(function(data)
            {
                var rooms = data.data;
                for(var i = 0; i < rooms.length; i++){
                    var newRoom = {
                        name: rooms[i].room,
                        oldName: undefined,
                        isNew: false
                    };
                    $scope.rooms.push(newRoom);
                }
                $scope.error = undefined;
            },function(response){
                $scope.handleErrorDB(response.status, response.data);
            });
        };

        this.modifyRoom = function(room){
            room.oldName = room.name;
        };

        this.updateRoomInDB = function(room){
            databaseService.updateRoomDB(room, $scope.authToken).
                then(function() {
                    $scope.initRooms();
                    $scope.messageAdmin = "Salle mise à jour.";
                    $timeout(function () { $scope.messageAdmin = undefined; }, $scope.timeoutTime); 
                }, function(response) {
                    $scope.handleErrorDB(response.status, response.data);
                });
        };

        this.deleteRoomDB = function(room) {
            databaseService.deleteRoomDB(room, $scope.authToken).
                then(function() {
                    $scope.initRooms();
                    $scope.messageAdmin = "Salle supprimée.";
                    $timeout(function () { $scope.messageAdmin = undefined; }, $scope.timeoutTime); 
                }, function(response) {
                    $scope.handleErrorDB(response.status, response.data);
                });
        };

        this.addNewRoom = function() {
            var newRoom = {
                name: "Nouvelle salle",
                oldName: undefined,
                isNew: true
            };

            $scope.rooms.push(newRoom);
        };

    $scope.handleErrorDB = function(status, data){
      if(data.errorCode === -1) {
        authenticationService.ClearCredentials();
      }
      $scope.dataLoading = false;
      $scope.error = data.error;
      $timeout(function () { $scope.error = undefined; }, $scope.timeoutTime); 
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

