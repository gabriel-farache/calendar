
'use strict';
angular.module('calendarApp')
  .controller('adminConsoleController', function ($scope, $cookieStore, databaseService, sharedService) {
        $scope.adminToken = '';
        $scope.adminTokenEndTime = '';
        $scope.error = undefined;
        $scope.rooms=[];

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
                        $scope.error = response.data.error;
                        console.log(response);
                        $scope.dataLoading = false;
                    }
                );
            } else {
                $scope.error = 'Clef d\'authentification inconnu';
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
            },function(data, status){
                console.log(status);
                console.log(data);
                $scope.error = data.data.error;
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
                }, function(data) {
                    $scope.error = data.data.error;
                });
        };

        this.deleteRoomDB = function(room) {
            databaseService.deleteRoomDB(room, $scope.authToken).
                then(function() {
                    $scope.initRooms();
                    $scope.messageAdmin = "Salle supprimée.";
                }, function(data) {
                    $scope.error = data.data.error;
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


});

