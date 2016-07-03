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

    sharedService.prepForNewBookingAddedBroadcast = function() {
        this.broadcastNewBookingAdded();
    };

    sharedService.broadcastNewBookingAdded = function() {
        $rootScope.$broadcast('newBookingsAddedBroadcast');
    };
    

    return sharedService;
}

angular
    .module('calendarApp')
    .factory('sharedService', SharedService);

SharedService.$inject = ['$rootScope'];