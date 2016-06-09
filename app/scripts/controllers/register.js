'use strict';
 
 angular
    .module('calendarApp')
    .controller('registerController',   
function RegisterController($scope, databaseService, authenticationService, $location) {
    this.username = '';
    this.password = '';
    this.email = '';
    this.adminToken = '';
    $scope.dataLoading = false;
    $scope.error = undefined;

    this.initRegisterCtrl = function() {

    };
    this.register = function() {
        $scope.dataLoading = true;
        databaseService.register(this.email, this.username, 
            authenticationService.encodeDecode.encode(this.password), this.adminToken)
            .then(function (response) {
                    console.log(response);
                    $location.path('/loginout/login');
                }, function (response) {
                    console.log(response);
                    $scope.error = response.data.error;
                    $scope.dataLoading = false;
                }
            );
    };
});


