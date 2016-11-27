'use strict';
angular.module('calendarApp')
    .controller('userConsoleController', ['$scope', '$cookies', '$timeout', 'databaseService', 'sharedService', 'authenticationService', 'globalizationService',
        function($scope, $cookies, $timeout, databaseService, sharedService, authenticationService, globalizationService) {
            $scope.timeoutTime = 10000;
            $scope.isUpdating = false;
            $scope.booker = {};
            $scope.message = undefined;
            $scope.dataLoading = false;

            authenticationService.CheckCookiesValidity();

            $scope.$on('handleBroadcast', function() {
                var message = sharedService.message;
                $scope.authToken = message.token;
                $scope.booker.booker = message.username;
            });

            var globalsCookies = $cookies.getObject('globals');
            if (globalsCookies !== undefined) {
                $scope.authToken = globalsCookies.token;
                $scope.booker.oldBooker = globalsCookies.username;
                $scope.booker.booker = globalsCookies.username;
                $scope.isAdmin = globalsCookies.isAdmin;
            }

            $scope.initUser = function() {
                databaseService.getBookerEmailDB($scope.booker.booker, $scope.authToken).
                then(function(response) {
                    $scope.booker.email = response.data.email;
                    $scope.booker.newPassword = undefined;
                }, $scope.handleErrorDBCallback);
            };

            this.updateBookerSettings = function() {
                $scope.dataLoading = true;
                $scope.booker.password = authenticationService.encodeDecode.encode($scope.booker.password);
                var hasNewPassword = ($scope.booker.newPassword !== undefined);

                if ($scope.booker.password !== undefined) {
                    if ($scope.booker.newPassword !== undefined) {
                        $scope.booker.newPassword = authenticationService.encodeDecode.encode($scope.booker.newPassword);
                    }

                    if (!hasNewPassword || (hasNewPassword && $scope.booker.newPassword !== undefined)) {
                        databaseService.updateBookerSettingsDB($scope.booker, $scope.authToken).
                        then(function() {
                            $scope.message = globalizationService.getLocalizedString('USER_UPDATE_SUCCESSFUL_MSG');
                            $scope.isUpdating = false;
                            $scope.dataLoading = false;
                            $scope.booker.newPassword = undefined;
                            $scope.booker.password = undefined;
                            authenticationService.SetCredentials($scope.booker.booker, $scope.authToken, $scope.isAdmin, $scope.booker.email);
                            $timeout($scope.removeMessage, $scope.timeoutTime);
                            $scope.initUser();
                        }, $scope.handleErrorDBCallback);
                    } else {
                        $scope.error = globalizationService.getLocalizedString('LOGIN_ENCODE_PASSWORD_ERROR_MSG');
                        $timeout($scope.removeErrorMessage, $scope.timeoutTime);
                    }
                } else {
                    $scope.error = globalizationService.getLocalizedString('LOGIN_ENCODE_PASSWORD_ERROR_MSG');
                    $timeout($scope.removeErrorMessage, $scope.timeoutTime);
                }
            };

            this.enableUpdateSettings = function() {
                $scope.isUpdating = true;
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