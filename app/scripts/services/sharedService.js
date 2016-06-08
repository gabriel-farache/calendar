'use strict';

function SharedService($rootScope) {
    var sharedService = {};
    
    sharedService.message = '';

    sharedService.prepForBroadcast = function(msg) {
        this.message = msg;
        this.broadcastItem();
    };

    sharedService.broadcastItem = function() {
        $rootScope.$broadcast('handleBroadcast');
    };

    return sharedService;
}

angular
    .module('calendarApp')
    .factory('sharedService', SharedService);

SharedService.$inject = ['$rootScope'];