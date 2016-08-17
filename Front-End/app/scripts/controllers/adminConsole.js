
'use strict';
angular.module('calendarApp')
  .controller('adminConsoleController', ['$scope', '$cookies', '$timeout', '$sce', 'databaseService', 'sharedService', 'authenticationService', 'globalizationService', 
    function ($scope, $cookies, $timeout, $sce, databaseService, sharedService, authenticationService, globalizationService) {
        $scope.adminToken = '';
        $scope.adminTokenEndTime = '';
        $scope.error = undefined;
        $scope.dataLoading = false;
        $scope.rooms=[];
        $scope.bookers=[];
        $scope.timeoutTime = 5000;
        $scope.size=10;
        $scope.$on('handleBroadcast', function() {
            var message = sharedService.message;
            $scope.authToken = message.token;
        });

        var globalsCookies = $cookies.get('globals');
        if(globalsCookies !== undefined) {
            $scope.authToken = globalsCookies.token;
        }

        this.generateAdminToken = function() {
            $scope.error = undefined;
            $scope.dataLoading = true;
            var globalsCookies = $cookies.get('globals');
            if(globalsCookies !== undefined) {
                databaseService.generateAdminToken(globalsCookies.token).
                then(function (response) {
                        var data = response.data;
                        $scope.dataLoading = false;
                        $scope.adminToken = data.adminToken;
                        $scope.adminTokenEndTime = data.adminTokenEndTime;
                    },$scope.handleErrorDBCallback);
            } else {
                $scope.dataLoading = false;
                $scope.error = globalizationService.getLocalizedString('ADMIN_UNKNOWN_AUTH_KEY_MSG');
                $timeout($scope.removeErrorMessage, $scope.timeoutTime); 
            }
            
        };

        $scope.initRooms = function() {
            $scope.rooms=[];
            $scope.dataLoading = true;
            databaseService.getRoomsDB().then(function(data)
            {
                $scope.dataLoading = false;
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
            },$scope.handleErrorDBCallback);
        };


        this.modifyRoom = function(room){
            room.oldName = room.name;
        };

        this.updateRoomInDB = function(room){
            $scope.dataLoading = true;
            databaseService.addRoomDB(room, $scope.authToken).
                then(function() {
                    $scope.dataLoading = false;
                    $scope.initRooms();
                    $scope.messageAdmin = globalizationService.getLocalizedString('ADMIN_ROOM_UPDATED_MSG');
                    $timeout($scope.removeAdminMessage, $scope.timeoutTime); 
                },$scope.handleErrorDBCallback);
        };

        this.deleteRoomDB = function(room) {
            $scope.dataLoading = true;
            databaseService.deleteRoomDB(room, $scope.authToken).
                then(function() {
                    $scope.dataLoading = false;
                    $scope.initRooms();
                    $scope.messageAdmin = globalizationService.getLocalizedString('ADMIN_ROOM_DELETED_MSG');
                    $timeout($scope.removeAdminMessage, $scope.timeoutTime); 
                },$scope.handleErrorDBCallback);
        };

        this.addNewRoom = function() {
            var newRoom = {
                name: globalizationService.getLocalizedString('ADMIN_NEW_ROOM_MSG'),
                oldName: undefined,
                isNew: true
            };

            $scope.rooms.push(newRoom);
        };

        $scope.initBookers = function() {
            $scope.dataLoading = true;
            $scope.bookers=[];
            databaseService.getBookersDB().then(function(data)
            {
                $scope.dataLoading = false;
                var bookers = data.data;
                for(var i = 0; i < bookers.length; i++){
                    var newBooker = {
                        booker: bookers[i].booker,
                        color: bookers[i].color,
                        oldName: undefined,
                        isNew: false
                    };
                    $scope.bookers.push(newBooker);
                }
                $scope.error = undefined;
            },$scope.handleErrorDBCallback);
        };

        this.modifyBooker = function(booker){
            booker.oldName = booker.booker;
        };

        this.updateBookerInDB = function(booker){
            $scope.dataLoading = true;
            databaseService.updateBookerDB(booker, $scope.authToken).
                then(function() {
                    $scope.dataLoading = false;
                    $scope.initBookers();
                    $scope.messageAdmin = globalizationService.getLocalizedString('ADMIN_USER_UPDATED_MSG');
                    $timeout($scope.removeAdminMessage, $scope.timeoutTime); 
                },$scope.handleErrorDBCallback);
        };

        this.deleteBookerDB = function(booker) {
            $scope.dataLoading = true;
            databaseService.deleteBookerDB(booker, $scope.authToken).
                then(function() {
                    $scope.dataLoading = false;
                    $scope.initBookers();
                    $scope.messageAdmin = globalizationService.getLocalizedString('ADMIN_USER_DELETED_MSG');
                    $timeout($scope.removeAdminMessage, $scope.timeoutTime); 
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

