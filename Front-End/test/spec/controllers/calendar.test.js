'use strict';
var databaseServiceMock;
describe('calendar', function() {

    beforeEach(module('calendarApp'));
    
    var adminAuthToken = 'AAAA';
    var databaseServiceMock;
    var emailServiceMock;
    var $q;

    beforeEach(function () {
        emailServiceMock = {
            sendEmail : function(from, to, cc, subject, message, adminAuthToken){
                return true;
            }
        };

        databaseServiceMock = {
            getBookingDB              : function(index) { 
                                            var deferred = $q.defer();
                                            var response = {};
                                            if($scope.bookings !== undefined &&
                                                index < $scope.bookings.length &&
                                                index >= 0) {
                                                response = {'data': $scope.bookings[index]};
                                                deferred.resolve(response);
                                            } else {
                                                response = {'data': {'error': 'Incorrect index or empty bookings'}};
                                                deferred.reject(response);
                                            }
                                            return deferred.promise;
                                             
                                        },
            getWeekBookingDB          : function(year, week, currentRoom) { 
                                            var deferred = $q.defer();
                                            var weekBookings = [];
                                            for(var i = 0; i < $scope.bookings.length; i++) {
                                                var booking = $scope.bookings[i];
                                                if(booking !== undefined &&
                                                    booking.year === year &&
                                                    booking.week === week &&
                                                    booking.room === currentRoom) {
                                                    weekBookings.push(booking);
                                                }
                                            }

                                            var response = {'data': weekBookings};
                                            deferred.resolve(response);
                                            return deferred.promise;
                                        },
            addBookingDB              : function(booking, authToken) {
                                            var deferred = $q.defer();
                                            var response = {};
                                            if(authToken === $scope.authToken) {
                                                $scope.bookings.push(booking);
                                                response.data = {'id': 999};
                                                deferred.resolve(response);
                                            } else {
                                                response.data = {'error': 'Auth token invalid'};
                                                response.status = 403;
                                                deferred.reject(response);
                                            }
                                            return deferred.promise;
                                        },
            deleteBookingDB           : function(index, username, authToken) {
                                            var deferred = $q.defer();
                                            var response = {};
                                            if($scope.bookings !== undefined &&
                                                index >= 0 && index < $scope.bookings.length) {
                                                if(authToken === 'XXXX') {
                                                    if($scope.bookings[index].bookedBy === username) {
                                                        var newBookings = [];
                                                        for(var i = 0; i < $scope.bookings.length; i++) {
                                                            if($scope.bookings[i].id !== index) {
                                                                newBookings.push($scope.bookings[i]);
                                                            }
                                                        }
                                                        $scope.bookings = newBookings;
                                                        deferred.resolve(response);
                                                    } else {
                                                        response.data = {'error': 'Wrong username'};
                                                        response.status = 403;
                                                        deferred.reject(response);
                                                    }
                                                } else {
                                                    response.data = {'error': 'Auth token invalid'};
                                                    response.status = 403;
                                                    deferred.reject(response);
                                                }
                                            } else {
                                                response = {'data': {'error': 'Incorrect index or empty bookings'}};
                                                deferred.reject(response);
                                            }
                                            return deferred.promise;
                                        },
            getRoomsDB                : function() {    
                                                        var deferred = $q.defer();
                                                        var response = {'data': $scope.rooms};
                                                        deferred.resolve(response); 
                                                        return deferred.promise;
                                                    },
            getBookersDB              : function() { 
                                                        var deferred = $q.defer();
                                                        var response = {'data': $scope.bookers};
                                                        deferred.resolve(response);
                                                        return deferred.promise;
                                                    },
            updateBookerDB            : function(booker, authToken) { },
            deleteBookerDB            : function(booker, authToken) { },
            validateBookingDB         : function(bookingId, authToken) { 
                                            var deferred = $q.defer();
                                            var response = {};
                                            if($scope.bookings !== undefined &&
                                                bookingId !== undefined) {
                                                if(authToken === adminAuthToken) {
                                                    for(var i = 0; i < $scope.bookings.length; i++) {
                                                        if($scope.bookings[i].id === bookingId) {
                                                            $scope.bookings[i].isValidated = true;
                                                        }
                                                    }
                                                    response.data = {'data': 'Booking validated'};
                                                    deferred.resolve(response);
                                                } else {
                                                    response.data = {'error': 'Auth token invalid: not admin token'};
                                                    response.status = 403;
                                                    deferred.reject(response);
                                                }
                                            } else {
                                                response = {'data': {'error': 'Incorrect booking id or empty bookings'}};
                                                deferred.reject(response);
                                            }
                                            return deferred.promise;
                                        },
            authenticate              : function(username, encodedPassword) { },
            register                  : function(email, username, encodedPassword, generatedAdminToken) { },
            generateAdminToken        : function(adminAuthToken) { },
            deleteBookingsDB          : function(bookingsToRemoveIds, authToken) { 
                                            var newBookings = [];
                                            var deferred = $q.defer();
                                            var response = {};
                                            if(bookingsToRemoveIds !== undefined) {
                                                for(var i = 0; i < $scope.bookings.length; i++){
                                                    var isToBeDeleted = false;
                                                    for(var j = 0; j < bookingsToRemoveIds.length; j++){
                                                        if(bookingsToRemoveIds[j] ===  $scope.bookings[i].id){
                                                            isToBeDeleted = true;
                                                        }
                                                    }
                                                    if(!isToBeDeleted) {
                                                        newBookings.push($scope.bookings[i]);
                                                    }
                                                }
                                                $scope.bookings = newBookings;
                                                response.data = {'data': 'Bookings deleted'};
                                            } else {
                                                response = {'data': {'error': 'No IDs to be deleted'}};
                                                deferred.reject(response);
                                            }
                                            return deferred.promise;
                                        },
            updateRoomDB              : function(room, authToken) { },
            deleteRoomDB              : function(room, authToken) { },
            getFreeRoomsForSlot       : function(day, scheduleStart, scheduleEnd) { },
            getBookerEmailDB          : function(booker, authToken) {
                                            var email;
                                            var deferred = $q.defer();
                                            var response = {};
                                            if(booker !== undefined) {
                                                for (var i = 0; i < $scope.bookers.length && email === undefined; i++) {
                                                    if(booker = $scope.bookers[i].booker) {
                                                        email = $scope.bookers[i].email;
                                                    }
                                                }
                                                response.data = {'email':email};
                                                deferred.resolve(response);
                                            } else {
                                                response.data = {'error': 'booker undefined'};
                                                deferred.reject(response);
                                            }
                                            return deferred.promise;
                                        },
            updateBookerSettingsDB    : function(booker, authToken) { },
            addRoomDB                 : function(room, authToken) { },
            getPeriodicBookingsDB     : function(bookerName, authToken) { },
            addPeriodicBookingDB      : function(newPeriodicBooking, bookerName, authToken) { },
            deletePeriodicBookingDB   : function(periodicBookingID, bookerName, currentWeek, dayStr, leftWeekDuration, authToken) { },
            validatePeriodicBookingDB : function(periodicBookingID, bookerName, authToken) { },
            getPeriodicBookingDB      : function(periodicBookingID, authToken) { },
            getConflictedBookingsDB   : function(booking) { },
            getDayBookingsDB          : function(day, room) { }
        };
        
        module(function ($provide) {
            $provide.value('databaseService', databaseServiceMock);
            $provide.value('emailService', emailServiceMock);
        });

        inject(function ($injector) {
            $q = $injector.get('$q');
        });
    });
    var $scope;
    var $rootScope;
        
    describe('calendarController', function() {
        var calendarController;
        var $http, $window, $cookieStore, $timeout, $interval, moment, 
            sharedService, authenticationService, emailService,
            globalizationService, commonService;


        beforeEach(inject(function($controller, _$rootScope_, _$http_, _$window_, _$timeout_, _$interval_, 
            _moment_, _sharedService_, _authenticationService_, _emailService_,
            _globalizationService_, _commonService_) {
            $rootScope = _$rootScope_;
            $http = _$http_;
            $window = _$window_;
            $timeout = _$timeout_;
            $interval = _$interval_;
            $scope = $rootScope.$new();
            moment = _moment_;
            sharedService = _sharedService_;
            authenticationService = _authenticationService_;
            emailService = _emailService_;
            globalizationService = _globalizationService_;
            commonService = _commonService_;
            calendarController = $controller('calendarController', {
                $scope: $scope,
                $http: $http,
                $window: $window,
                $timeout: $timeout,
                $interval: $interval,
                moment: moment,
                //databaseService: databaseServiceMock,
                sharedService: sharedService,
                authenticationService: authenticationService,
                emailService: emailService,
                globalizationService: globalizationService,
                commonService: commonService
            });
        }));

        

        describe('removeMessage', function() {
            it('The message shall be undefined', function() {
                $scope.message = 'Test';
                $scope.removeMessage();
                expect($scope.message).toBe(undefined);
            });
        });

        describe('removeAdminMessage', function() {
            it('The admin message shall be undefined', function() {
                $scope.messageAdmin = 'Test';
                $scope.removeAdminMessage();
                expect($scope.messageAdmin).toBe(undefined);
            });
        });

        describe('removeErrorMessage', function() {
            it('The error message shall be undefined', function() {
                $scope.error = 'Test';
                $scope.removeErrorMessage();
                expect($scope.error).toBe(undefined);
            });
        });

        describe('handleErrorDB', function() {
            it('With data undefined, crendentials shall remain the same, dataLoading shall be false and the error message shall be unexpected error', function() {
                var status = '404';
                var data = undefined;
                $scope.username = 'Test Username';
                $scope.isAdmin = true;
                $scope.authToken = 'XXXX';
                $scope.booking.bookedBy = 'Unknown';
                $scope.dataLoading = true;
                $scope.handleErrorDB(status, data);
                expect($scope.username).toBe('Test Username');
                expect($scope.isAdmin).toBe(true);
                expect($scope.authToken).toBe('XXXX');
                expect($scope.booking.bookedBy).toBe('Unknown');
                expect($scope.error).toBe('Unexpected error');
                expect($scope.dataLoading).toBe(false);
            });
            it('With data defined, crendentials shall be deleted, dataLoading shall be false and the error message shall be the data one', function() {
                var status = '404';
                var data = {};
                data.error = 'Data error';
                $scope.username = 'Test Username';
                $scope.isAdmin = true;
                $scope.authToken = 'XXXX';
                $scope.booking.bookedBy = 'Unknown';
                $scope.guestName = 'guestName';
                $scope.dataLoading = true;
                $scope.handleErrorDB(status, data);
                expect($scope.username).toBe('guestName');
                expect($scope.isAdmin).toBe(false);
                expect($scope.authToken).toBe(undefined);
                expect($scope.booking.bookedBy).toBe(undefined);
                expect($scope.error).toBe('Data error');
                expect($scope.dataLoading).toBe(false);
            });
        });

        describe('handleErrorDBCallback', function() {
            it('With response undefined, crendentials shall remain the same, dataLoading shall be false and the error message shall be unexpected error', function() {
                var status = '404';
                var response = undefined;
                $scope.username = 'Test Username';
                $scope.isAdmin = true;
                $scope.authToken = 'XXXX';
                $scope.booking.bookedBy = 'Unknown';
                $scope.dataLoading = true;
                $scope.handleErrorDBCallback(response);
                expect($scope.username).toBe('Test Username');
                expect($scope.isAdmin).toBe(true);
                expect($scope.authToken).toBe('XXXX');
                expect($scope.booking.bookedBy).toBe('Unknown');
                expect($scope.error).toBe('Unexpected error');
                expect($scope.dataLoading).toBe(false);
            });
            it('With response defined and data undefined, crendentials shall remain the same, dataLoading shall be false and the error message shall be unexpected error', function() {
                var status = '404';
                var response = {};
                response.data = undefined;
                response.status = {};
                $scope.username = 'Test Username';
                $scope.isAdmin = true;
                $scope.authToken = 'XXXX';
                $scope.booking.bookedBy = 'Unknown';
                $scope.dataLoading = true;
                $scope.handleErrorDBCallback(response);
                expect($scope.username).toBe('Test Username');
                expect($scope.isAdmin).toBe(true);
                expect($scope.authToken).toBe('XXXX');
                expect($scope.booking.bookedBy).toBe('Unknown');
                expect($scope.error).toBe('Unexpected error');
                expect($scope.dataLoading).toBe(false);
            });
            it('With response defined and data empty object crendentials shall be deleted, dataLoading shall be false and the error message shall be undefined', function() {
                var status = '404';
                var response = {};
                response.data = {};
                response.status = {};
                $scope.username = 'Test Username';
                $scope.isAdmin = true;
                $scope.authToken = 'XXXX';
                $scope.booking.bookedBy = 'Unknown';
                $scope.guestName = 'guestName';
                $scope.dataLoading = true;
                $scope.handleErrorDBCallback(response);
                expect($scope.username).toBe('guestName');
                expect($scope.isAdmin).toBe(false);
                expect($scope.authToken).toBe(undefined);
                expect($scope.booking.bookedBy).toBe(undefined);
                expect($scope.error).toBe(undefined);
                expect($scope.dataLoading).toBe(false);
            });
            it('With response defined and data defined crendentials shall be deleted, dataLoading shall be false and the error message shall be the data one', function() {
                var status = '404';
                var response = {};
                response.data = {};
                response.status = {};
                response.data.error = 'Data error';
                $scope.username = 'Test Username';
                $scope.isAdmin = true;
                $scope.authToken = 'XXXX';
                $scope.booking.bookedBy = 'Unknown';
                $scope.guestName = 'guestName';
                $scope.dataLoading = true;
                $scope.handleErrorDBCallback(response);
                expect($scope.username).toBe('guestName');
                expect($scope.isAdmin).toBe(false);
                expect($scope.authToken).toBe(undefined);
                expect($scope.booking.bookedBy).toBe(undefined);
                expect($scope.error).toBe('Data error');
                expect($scope.dataLoading).toBe(false);
            });
        });
        describe('deleteBooking', function() {
            beforeEach(function() {
                $scope.username = 'Test Username';
                $scope.bookings = [
                                    { 
                                        'id'             :   0,
                                        'room'           :   'Room 01',
                                        'scheduleStart'  :   '0',
                                        'scheduleEnd'    :   '0.5',
                                        'day'            :   'Mon 05-05-2016',
                                        'week'           :   '10',
                                        'year'           :   '2016',
                                        'bookedBy'       :   $scope.username,
                                        'isValidated'    :   false,
                                        'isPeriodic'     :   false
                                    },
                                    { 
                                        'id'             :   1,
                                        'room'           :   'Room 01',
                                        'scheduleStart'  :   '0',
                                        'scheduleEnd'    :   '0.5',
                                        'day'            :   'Mon 05-05-2016',
                                        'week'           :   '10',
                                        'year'           :   '2016',
                                        'bookedBy'       :   'Other User',
                                        'isValidated'    :   false,
                                        'isPeriodic'     :   false
                                    },
                                    { 
                                        'id'             :   2,
                                        'room'           :   'Room 01',
                                        'scheduleStart'  :   '0',
                                        'scheduleEnd'    :   '0.5',
                                        'day'            :   'Mon 05-05-2016',
                                        'week'           :   '10',
                                        'year'           :   '2016',
                                        'bookedBy'       :   $scope.username,
                                        'isValidated'    :   false,
                                        'isPeriodic'     :   false
                                    }
                                ];
            });
            it('Delete user booking correctly: good ID and username and authToken)', function() {        
                $scope.authToken = 'XXXX';
                $scope.dataLoading = true;
                $scope.booking = {'id': 0};
                calendarController.deleteBooking();

                expect($scope.bookings.length).toBe(2);
                expect($scope.bookings[0].id).toBe(1);
                expect($scope.bookings[0].bookedBy).toBe('Other User');
                expect($scope.error).toBe(undefined);
            });
            it('Delete user booking with wrong authToken)', function() {        
                $scope.isAdmin = true;
                $scope.authToken = 'YYYY';
                $scope.dataLoading = true;

                $scope.booking = {'id': 0};
                calendarController.deleteBooking();
                $rootScope.$apply();
                expect($scope.bookings.length).toBe(3);
                expect($scope.bookings[0].id).toBe(0);
                expect($scope.bookings[0].bookedBy).toBe('Test Username');
                expect($scope.message).toBe(undefined);
                expect($scope.dataLoading).toBe(false);
                expect($scope.error).toBe('Auth token invalid');
            });

            it('Delete user booking with wrong username)', function() {        
                $scope.isAdmin = true;
                $scope.authToken = 'XXXX';
                $scope.dataLoading = true;
                $scope.username = 'Other user';
                $scope.booking = {'id': 0};
                calendarController.deleteBooking();
                $rootScope.$apply();
                expect($scope.bookings.length).toBe(3);
                expect($scope.bookings[0].id).toBe(0);
                expect($scope.bookings[0].bookedBy).toBe('Test Username');
                expect($scope.message).toBe(undefined);
                expect($scope.dataLoading).toBe(false);
                expect($scope.error).toBe('Wrong username');
            });
            it('Delete user booking with too small index)', function() {        
                $scope.isAdmin = true;
                $scope.authToken = 'XXXX';
                $scope.dataLoading = true;

                $scope.booking = {'id': -1};
                calendarController.deleteBooking();
                $rootScope.$apply();
                expect($scope.bookings.length).toBe(3);
                expect($scope.bookings[0].id).toBe(0);
                expect($scope.bookings[0].bookedBy).toBe('Test Username');
                expect($scope.message).toBe(undefined);
                expect($scope.dataLoading).toBe(false);
                expect($scope.error).toBe('Incorrect index or empty bookings');
            });
            it('Delete user booking with too big index)', function() {        
                $scope.isAdmin = true;
                $scope.authToken = 'XXXX';
                $scope.dataLoading = true;

                $scope.booking = {'id': 90};
                calendarController.deleteBooking();
                $rootScope.$apply();
                expect($scope.bookings.length).toBe(3);
                expect($scope.bookings[0].id).toBe(0);
                expect($scope.bookings[0].bookedBy).toBe('Test Username');
                expect($scope.message).toBe(undefined);
                expect($scope.dataLoading).toBe(false);
                expect($scope.error).toBe('Incorrect index or empty bookings');
            });
            it('Delete user booking with empty bookings)', function() {        
                $scope.isAdmin = true;
                $scope.authToken = 'XXXX';
                $scope.dataLoading = true;
                $scope.bookings = {};
                $scope.booking = {'id': 0};
                calendarController.deleteBooking();
                $rootScope.$apply();
                expect($scope.bookings.length).toBe(undefined);
                expect($scope.message).toBe(undefined);
                expect($scope.dataLoading).toBe(false);
                expect($scope.error).toBe('Incorrect index or empty bookings');
            });
        });
        describe('isBookingValidated', function() {
            beforeEach(function() {
                $scope.username = 'Test Username';
                $scope.calendar = [
                                    { 
                                        'id'             :   0,
                                        'room'           :   'Room 01',
                                        'scheduleStart'  :   '0',
                                        'scheduleEnd'    :   '0.5',
                                        'day'            :   'Mon 05-05-2016',
                                        'week'           :   '10',
                                        'year'           :   '2016',
                                        'bookedBy'       :   $scope.username,
                                        'isValidated'    :   true,
                                        'isPeriodic'     :   false
                                    },
                                    { 
                                        'id'             :   1,
                                        'room'           :   'Room 01',
                                        'scheduleStart'  :   '0',
                                        'scheduleEnd'    :   '0.5',
                                        'day'            :   'Mon 05-05-2016',
                                        'week'           :   '10',
                                        'year'           :   '2016',
                                        'bookedBy'       :   'Other User',
                                        'isValidated'    :   true,
                                        'isPeriodic'     :   false
                                    },
                                    { 
                                        'id'             :   2,
                                        'room'           :   'Room 01',
                                        'scheduleStart'  :   '0',
                                        'scheduleEnd'    :   '0.5',
                                        'day'            :   'Mon 05-05-2016',
                                        'week'           :   '10',
                                        'year'           :   '2016',
                                        'bookedBy'       :   $scope.username,
                                        'isValidated'    :   false,
                                        'isPeriodic'     :   false
                                    }
                                ];
            });
            it('The validated booking is validated, result shall be true', function() {   
                var result = calendarController.isBookingValidated(0, $scope.calendar);
                expect(result).toBe(true);
            });
            it('The validated booking is not validated, result shall be false', function() {   
                var result = calendarController.isBookingValidated(2, $scope.calendar);
                expect(result).toBe(false);
            });
            it('The validated booking does not exist, result shall be false', function() {   
                var positive = calendarController.isBookingValidated(56, $scope.calendar);
                var negative = calendarController.isBookingValidated(-1, $scope.calendar);
                expect(positive).toBe(false);
                expect(negative).toBe(false);
            });
            it('The calendar is empty, result shall be false', function() {  
                $scope.calendar = []; 
                var empty = calendarController.isBookingValidated(0, $scope.calendar);
                expect(empty).toBe(false);
            });
            it('The calendar is undefined, result shall be false', function() {  
                $scope.calendar = undefined; 
                var empty = calendarController.isBookingValidated(0, $scope.calendar);
                expect(empty).toBe(false);
            });
        });
        describe('validateBooking', function() {
            beforeEach(function() {
                $scope.username = 'Test Username';
                $scope.booking = { 
                                    'id'             :   0,
                                    'room'           :   'Room 01',
                                    'scheduleStart'  :   '0',
                                    'scheduleEnd'    :   '0.5',
                                    'day'            :   'Mon 05-05-2016',
                                    'week'           :   '10',
                                    'year'           :   '2016',
                                    'bookedBy'       :   $scope.username,
                                    'isValidated'    :   false,
                                    'isPeriodic'     :   false
                                };
                $scope.calendar = [$scope.booking,
                                    { 
                                        'id'             :   1,
                                        'room'           :   'Room 01',
                                        'scheduleStart'  :   '0',
                                        'scheduleEnd'    :   '0.5',
                                        'day'            :   'Mon 05-05-2016',
                                        'week'           :   '10',
                                        'year'           :   '2016',
                                        'bookedBy'       :   'Other User',
                                        'isValidated'    :   true,
                                        'isPeriodic'     :   false
                                    },
                                    { 
                                        'id'             :   2,
                                        'room'           :   'Room 01',
                                        'scheduleStart'  :   '0',
                                        'scheduleEnd'    :   '0.5',
                                        'day'            :   'Mon 05-05-2016',
                                        'week'           :   '10',
                                        'year'           :   '2016',
                                        'bookedBy'       :   $scope.username,
                                        'isValidated'    :   false,
                                        'isPeriodic'     :   false
                                    }
                                ];
                $scope.bookings = [$scope.booking,
                                    { 
                                        'id'             :   1,
                                        'room'           :   'Room 01',
                                        'scheduleStart'  :   '0',
                                        'scheduleEnd'    :   '0.5',
                                        'day'            :   'Mon 05-05-2016',
                                        'week'           :   '10',
                                        'year'           :   '2016',
                                        'bookedBy'       :   'Other User',
                                        'isValidated'    :   true,
                                        'isPeriodic'     :   false
                                    },
                                    { 
                                        'id'             :   2,
                                        'room'           :   'Room 01',
                                        'scheduleStart'  :   '0',
                                        'scheduleEnd'    :   '0.5',
                                        'day'            :   'Mon 05-05-2016',
                                        'week'           :   '10',
                                        'year'           :   '2016',
                                        'bookedBy'       :   $scope.username,
                                        'isValidated'    :   false,
                                        'isPeriodic'     :   false
                                    }
                                ];
                $scope.bookers = [ 
                                    {
                                        booker: $scope.username,
                                        password: 'QXplcnR5',
                                        isAdmin: false,
                                        color: '#009688',
                                        email:'test.user@gmail.com'
                                    },
                                    {
                                        booker:'Other User',
                                        password: 'QXplcnR5',
                                        isAdmin: false,
                                        color: '#009688',
                                        email:'other.user@gmail.com'
                                    }
                                ];
            });
            it('Validate existing booking not validated yet with admin auth token, booking is validated', function() { 
                $scope.authToken = 'AAAA';  
                calendarController.validateBooking();
                $rootScope.$apply();
                expect($scope.booking.isValidated).toBe(true);
            });
            it('Validate existing booking already validated  with admin auth token, booking still validated', function() {   
                $scope.authToken = 'AAAA';  
                $scope.booking.isValidated = true;
                calendarController.validateBooking();
                $rootScope.$apply();
                expect($scope.booking.isValidated).toBe(true);
            });
            it('Validate existing booking not validated yet without admin auth token, booking is not validated', function() { 
                $scope.authToken = 'XXXX';  
                calendarController.validateBooking();
                $rootScope.$apply();
                expect($scope.booking.isValidated).toBe(false);
                expect($scope.error).toBe('Auth token invalid: not admin token');
            });
            it('Validate existing booking already validated  without admin auth token, booking still validated', function() {   
                $scope.authToken = 'XXXX';  
                $scope.booking.isValidated = true;
                calendarController.validateBooking();
                $rootScope.$apply();
                expect($scope.booking.isValidated).toBe(true);
                expect($scope.error).toBe('Auth token invalid: not admin token');
            });
            it('Validate existing booking with admin auth token on empty calendar', function() {   
                $scope.authToken = 'AAAA';  
                $scope.bookings = undefined;
                calendarController.validateBooking();
                $rootScope.$apply();
                expect($scope.error).toBe('Incorrect booking id or empty bookings');
            });
            it('Validate existing booking with admin auth token on empty booking', function() {   
                $scope.authToken = 'AAAA';  
                $scope.booking = {};
                calendarController.validateBooking();
                $rootScope.$apply();
                expect($scope.error).toBe('Undefined booking or booking id');
            });
            it('Validate existing booking with admin auth token on empty booking ID', function() {   
                $scope.authToken = 'AAAA';  
                $scope.booking.id = undefined;
                calendarController.validateBooking();
                $rootScope.$apply();
                expect($scope.error).toBe('Undefined booking or booking id');
            });
        });
    });
});

