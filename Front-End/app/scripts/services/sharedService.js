'use strict';

function SharedService($rootScope) {
    var sharedService = {};
    
    sharedService.message = '';
    sharedService.calendar = [];
    sharedService.booking = {};
    sharedService.callerName = '';

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

    sharedService.prepForBookingValidatedBroadcast = function(calendar, booking, caller) {
        this.calendar = calendar;
        this.booking = booking;
        this.callerName = caller;
        this.broadcastBookingValidated();
    };

    sharedService.broadcastBookingValidated = function() {
        $rootScope.$broadcast('BookingValidated');
    };

    sharedService.prepForI18nLoadedBroadcast = function() {
        this.broadcastI18nLoaded();
    };
    
    sharedService.broadcastI18nLoaded = function() {
        $rootScope.$broadcast('i18nLoaded');
    };

    return sharedService;
}

angular
    .module('calendarApp')
    .factory('sharedService', SharedService);

SharedService.$inject = ['$rootScope'];