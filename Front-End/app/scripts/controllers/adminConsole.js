'use strict';
angular.module('calendarApp')
    .controller('adminConsoleController', ['$scope', '$cookies', '$location', '$timeout', '$sce', 'databaseService', 'sharedService', 'authenticationService', 'globalizationService', 'FileSaver', 'Blob',
        function($scope, $cookies, $location, $timeout, $sce, databaseService, sharedService, authenticationService, globalizationService, FileSaver, Blob) {
            $scope.adminToken = '';
            $scope.adminTokenEndTime = '';
            $scope.error = undefined;
            $scope.dataLoading = false;
            $scope.rooms = [];
            $scope.bookers = [];
            $scope.timeoutTime = 5000;
            $scope.size = 10;
            $scope.userEmail = undefined;
            $scope.guestName = 'Visiteur';
            $scope.availableYears = {};
            $scope.availableYearMonths = [];
            $scope.metricData = undefined;
            this.metric = {};

            authenticationService.CheckCookiesValidity();

            $scope.$on('handleBroadcast', function() {
                var message = sharedService.message;
                $scope.authToken = message.token;
                $scope.userEmail = message.userEmail;
            });

            var globalsCookies = $cookies.getObject('globals');
            if (globalsCookies !== undefined) {
                $scope.authToken = globalsCookies.token;
                $scope.userEmail = globalsCookies.userEmail;
            }

            if (($scope.userEmail === undefined || $scope.userEmail === '') &&
                $scope.guestName !== $scope.username && $scope.username !== undefined) {
                $location.path('/userConsole');
            }

            this.generateAdminToken = function() {
                $scope.error = undefined;
                $scope.dataLoading = true;
                var globalsCookies = $cookies.getObject('globals');
                if (globalsCookies !== undefined) {
                    databaseService.generateAdminToken(globalsCookies.token).
                    then(function(response) {
                        var data = response.data;
                        $scope.dataLoading = false;
                        $scope.adminToken = data.adminToken;
                        $scope.adminTokenEndTime = data.adminTokenEndTime;
                    }, $scope.handleErrorDBCallback);
                } else {
                    $scope.dataLoading = false;
                    $scope.error = globalizationService.getLocalizedString('ADMIN_UNKNOWN_AUTH_KEY_MSG');
                    $timeout($scope.removeErrorMessage, $scope.timeoutTime);
                }

            };

            $scope.initRooms = function() {
                $scope.rooms = [];
                $scope.dataLoading = true;
                databaseService.getRoomsDB().then(function(data) {
                    $scope.dataLoading = false;
                    var rooms = data.data;
                    for (var i = 0; i < rooms.length; i++) {
                        var newRoom = {
                            name: rooms[i].room,
                            oldName: undefined,
                            isNew: false,
                            building: rooms[i].building
                        };
                        $scope.rooms.push(newRoom);
                    }
                    $scope.error = undefined;
                }, $scope.handleErrorDBCallback);
            };


            this.modifyRoom = function(room) {
                room.oldName = room.name;
                room.oldBuilding = room.building;
            };

            this.updateRoomInDB = function(room) {
                $scope.dataLoading = true;
                databaseService.updateRoomDB(room, $scope.authToken).
                then(function() {
                    $scope.dataLoading = false;
                    $scope.initRooms();
                    $scope.messageAdmin = globalizationService.getLocalizedString('ADMIN_ROOM_UPDATED_MSG');
                    $timeout($scope.removeAdminMessage, $scope.timeoutTime);
                }, $scope.handleErrorDBCallback);
            };

            this.deleteRoomDB = function(room) {
                $scope.dataLoading = true;
                databaseService.deleteRoomDB(room, $scope.authToken).
                then(function() {
                    $scope.dataLoading = false;
                    $scope.initRooms();
                    $scope.messageAdmin = globalizationService.getLocalizedString('ADMIN_ROOM_DELETED_MSG');
                    $timeout($scope.removeAdminMessage, $scope.timeoutTime);
                }, $scope.handleErrorDBCallback);
            };

            this.addNewRoom = function() {
                var newRoom = {
                    name: globalizationService.getLocalizedString('ADMIN_NEW_ROOM_MSG'),
                    building: globalizationService.getLocalizedString('ADMIN_NEW_ROOM_BUILDING_MSG'),
                    oldName: undefined,
                    isNew: true
                };

                $scope.rooms.push(newRoom);
            };

            $scope.initBookers = function() {
                $scope.dataLoading = true;
                $scope.bookers = [];
                databaseService.getBookersDB().then(function(data) {
                    $scope.dataLoading = false;
                    var bookers = data.data;
                    for (var i = 0; i < bookers.length; i++) {
                        var newBooker = {
                            booker: bookers[i].booker,
                            color: bookers[i].color,
                            oldName: undefined,
                            isNew: false
                        };
                        $scope.bookers.push(newBooker);
                    }
                    $scope.error = undefined;
                }, $scope.handleErrorDBCallback);
            };

            this.modifyBooker = function(booker) {
                booker.oldName = booker.booker;
            };

            this.updateBookerInDB = function(booker) {
                $scope.dataLoading = true;
                databaseService.updateBookerDB(booker, $scope.authToken).
                then(function() {
                    $scope.dataLoading = false;
                    $scope.initBookers();
                    $scope.messageAdmin = globalizationService.getLocalizedString('ADMIN_USER_UPDATED_MSG');
                    $timeout($scope.removeAdminMessage, $scope.timeoutTime);
                }, $scope.handleErrorDBCallback);
            };

            this.deleteBookerDB = function(booker) {
                $scope.dataLoading = true;
                databaseService.deleteBookerDB(booker, $scope.authToken).
                then(function() {
                    $scope.dataLoading = false;
                    $scope.initBookers();
                    $scope.messageAdmin = globalizationService.getLocalizedString('ADMIN_USER_DELETED_MSG');
                    $timeout($scope.removeAdminMessage, $scope.timeoutTime);
                }, $scope.handleErrorDBCallback);
            };

            this.initMetrics = function() {
                this.metric.month = 0;
                this.metric.year = 0;
                $scope.dataLoading = true;
                databaseService.getAvailableYearsForMetrics($scope.authToken).
                then(function(response) {
                    $scope.dataLoading = false;
                    $scope.availableYears = response.data;
                }, $scope.handleErrorDBCallback);
            };

            this.getYearMonthsAvailable = function() {
                $scope.dataLoading = true;
                databaseService.getYearMonthAvailable(this.metric.year, $scope.authToken).
                then(function(response) {
                    $scope.dataLoading = false;
                    var months = response.data;
                    $scope.availableYearMonths = [];
                    for (var i = 0; i < months.length; i++) {
                        var month = {};
                        month.display = $scope.convertMonthNumberToString(parseInt(months[i]));
                        month.value = months[i];
                        $scope.availableYearMonths.push(month);
                    }
                }, $scope.handleErrorDBCallback);
            };

            $scope.convertMonthNumberToString = function(month) {
                var display;
                switch (month) {
                    case 1:
                        display = globalizationService.getLocalizedString('ADMIN_METRIC_MONTH_JAN_LABEL');
                        break;
                    case 2:
                        display = globalizationService.getLocalizedString('ADMIN_METRIC_MONTH_FEB_LABEL');
                        break;
                    case 3:
                        display = globalizationService.getLocalizedString('ADMIN_METRIC_MONTH_MAR_LABEL');
                        break;
                    case 4:
                        display = globalizationService.getLocalizedString('ADMIN_METRIC_MONTH_APR_LABEL');
                        break;
                    case 5:
                        display = globalizationService.getLocalizedString('ADMIN_METRIC_MONTH_MAY_LABEL');
                        break;
                    case 6:
                        display = globalizationService.getLocalizedString('ADMIN_METRIC_MONTH_JUN_LABEL');
                        break;
                    case 7:
                        display = globalizationService.getLocalizedString('ADMIN_METRIC_MONTH_JUL_LABEL');
                        break;
                    case 8:
                        display = globalizationService.getLocalizedString('ADMIN_METRIC_MONTH_AUG_LABEL');
                        break;
                    case 9:
                        display = globalizationService.getLocalizedString('ADMIN_METRIC_MONTH_SEP_LABEL');
                        break;
                    case 10:
                        display = globalizationService.getLocalizedString('ADMIN_METRIC_MONTH_OCT_LABEL');
                        break;
                    case 11:
                        display = globalizationService.getLocalizedString('ADMIN_METRIC_MONTH_NOV_LABEL');
                        break;
                    case 12:
                        display = globalizationService.getLocalizedString('ADMIN_METRIC_MONTH_DEC_LABEL');
                        break;
                }
                return display;
            };

            this.computeMetrics = function() {
                $scope.dataLoading = true;
                databaseService.computeMetrics(this.metric, $scope.authToken).
                then(function(response) {
                    $scope.dataLoading = false;
                    $scope.metricData = response.data;
                }, $scope.handleErrorDBCallback);
            };

            this.exportMetrics = function() {
                var csvString = globalizationService.getLocalizedString('ADMIN_METRIC_BOOKER_LABEL') +
                    ';' + globalizationService.getLocalizedString('ADMIN_METRIC_TOTAL_BOOKING_TIME_LABEL');

                for (var i = 0; i < $scope.metricData.length; i++) {
                    var metric = $scope.metricData;
                    csvString = metric[i].booker + ';' + metric[i].bookingTotalTime + '\n';
                }
                var data = new Blob([csvString], { type: 'text/plain' });
                FileSaver.saveAs(data, 'metrics_' + this.metric.year + '_' + this.metric.month.display + '.csv');
            };

            $scope.handleErrorDBCallback = function(response) {
                $scope.handleErrorDB(response.status, response.data);
            };

            $scope.handleErrorDB = function(status, data) {
                if (status === 401) {
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
        }
    ]);