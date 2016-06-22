
'use strict';
angular.module('calendarApp')
  .controller('adminConsoleController', function ($scope, $cookieStore, $timeout, $sce, databaseService, sharedService, authenticationService) {
        $scope.adminToken = '';
        $scope.adminTokenEndTime = '';
        $scope.error = undefined;
        $scope.rooms=[];
        $scope.bookers=[];
        $scope.timeoutTime = 5000;
        $scope.size=10;
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

        $scope.initBookers = function() {
            $scope.bookers=[];
            databaseService.getBookersDB().then(function(data)
            {
                var bookers = data.data;
                for(var i = 0; i < bookers.length; i++){
                    var newBooker = {
                        booker: $sce.trustAsHtml(bookers[i].booker),
                        color: bookers[i].color,
                        oldName: undefined,
                        isNew: false
                    };
                    $scope.bookers.push(newBooker);
                }
                $scope.error = undefined;
            },function(response){
                $scope.handleErrorDB(response.status, response.data);
            });
        };

        this.modifyBooker = function(booker){
            booker.oldName = booker.booker;
        };

        this.updateBookerInDB = function(booker){
            databaseService.updateBookerDB(booker, $scope.authToken).
                then(function() {
                    $scope.initBookers();
                    $scope.messageAdmin = "Utilisateur mis à jour.";
                    $timeout(function () { $scope.messageAdmin = undefined; }, $scope.timeoutTime); 
                }, function(response) {
                    $scope.handleErrorDB(response.status, response.data);
                });
        };

        this.deleteBookerDB = function(booker) {
            databaseService.deleteBookerDB(booker, $scope.authToken).
                then(function() {
                    $scope.initBookers();
                    $scope.messageAdmin = "Utilisateur supprimé.";
                    $timeout(function () { $scope.messageAdmin = undefined; }, $scope.timeoutTime); 
                }, function(response) {
                    $scope.handleErrorDB(response.status, response.data);
                });
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

