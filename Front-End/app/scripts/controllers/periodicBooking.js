'use strict';

angular
    .module('calendarApp')
    .controller('periodicBookingController', ['$scope', '$cookies', '$timeout', '$location', 'moment', 'sharedService', 'databaseService', 'globalizationService', 'emailService', 'authenticationService', 'commonService',
    function PeriodicBookingController($scope, $cookies, $timeout, $location, moment, sharedService, databaseService, globalizationService, emailService, authenticationService, commonService) {
        moment.locale('fr');
        $scope.callerName = 'PeriodicBooking';
        $scope.dataLoading = false;
        $scope.week = '';
        $scope.year = '';
        $scope.isAdmin = false;
        $scope.periodicBookings  =[];
        $scope.timeoutTime = 5000;
        $scope.rooms = [];
        $scope.formattedPeriodicBookings = [];
        $scope.bookingsSharingSlotToBeCancelled = [];
        $scope.bookingConflitLoading = [];
        $scope.nbConflicts = [];
        $scope.nbQueriesConflicts = [];
        $scope.nbQueriesPropagate = [];

        this.periodicBookingStartingDay = undefined;
        this.periodicBookingStartingWeek = undefined;
        this.periodicBookingStartingYear = undefined;
        this.periodicBookingScheduleStart = undefined;
        this.periodicBookingScheduleEnd = undefined;
        this.periodicBookingWeeksDuration = undefined;
        this.selectedStartDay = undefined;
        this.selectedEndDay = undefined;
        this.periodicBookingRoom = undefined;

        this.dateStart = moment();
        this.dateEnd = moment();
        this.todayDate = this.dateStart.date();
        this.todayWeek = this.dateStart.week();
        this.todayMonth = this.dateStart.month();
        this.todayYear = this.dateStart.year();
        this.monthWeeks = [[],[]];
        this.day = this.dateStart.format('ddd DD-MM-YYYY');
        this.selectedStartDay = undefined;
        this.selectedStartMonth = undefined;
        this.selectedStartYear = undefined;
        this.selectedEndDay = undefined;
        this.selectedEndMonth = undefined;
        this.selectedEndYear = undefined;
        this.selectedStartingDate = undefined;
        this.selectedEndingDate = undefined;
        this.periodicDay = undefined;
        this.selectedEndWeek = undefined;

    this.schedulesLabels = ['0', '0:30', '1', '1:30', '2', '2:30', '3', '3:30', '4','4:30', '5', '5:30',
     '6', '6:30', '7', '7:30', '8', '8:30','9', '9:30', '10', '10:30', '11', '11:30', '12', '12:30',
     '13', '13:30', '14', '14:30', '15', '15:30', '16', '16:30', '17', '17:30', '18', '18:30',
     '19', '19:30', '20', '20:30', '21', '21:30', '22', '22:30', '23', '23:30', '0'];

    this.schedules = [0,0.5,1,1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10,
       10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 
       20, 20.5, 21, 21.5, 22, 22.5, 23, 23.5, 24];


        $scope.$on('handleBroadcast', function() {
            var message = sharedService.message;
            $scope.username = message.username;
            $scope.isAdmin = message.isAdmin;
            $scope.authToken = message.token;
        });

        var globalsCookies = $cookies.get('globals');
        if(globalsCookies !== undefined) {
            $scope.authToken = globalsCookies.token;
            $scope.isAdmin = globalsCookies.isAdmin;
            $scope.username = globalsCookies.username;
        }

        this.initPeriodicBooking = function() {
            this.initCalendar();
            this.initRooms();
            $scope.getPeriodicBookings();

        };

        this.initRooms = function() {
          databaseService.getRoomsDB().then(function(data)
          {
            var rooms = data.data;
            $scope.rooms = rooms;
            $scope.error = undefined;
          },$scope.handleErrorDBCallback);
        };

        $scope.getPeriodicBookings = function() {
            $scope.dataLoading = true;
            $scope.periodicBookings  =[];
            databaseService.getPeriodicBookingsDB($scope.username, $scope.authToken)
                .then(function(response) {
                    $scope.error = undefined;
                    $scope.dataLoading = false;
                    $scope.periodicBookings  = response.data;
                    $scope.formatPeriodicBookings();
                },$scope.handleErrorDBCallback);
        };

        $scope.formatPeriodicBookings = function() {
            $scope.formattedPeriodicBookings = [];
            for(var i = 0; i < $scope.periodicBookings.length; i++){
                try {
                    var periodicBooking = $scope.periodicBookings[i];
                    var formatPeriodicBooking = {
                        'day'       :   moment()
                                            .date(periodicBooking.periodicBookingStartingDay)
                                            .month(periodicBooking.periodicBookingStartingMonth)
                                            .year(periodicBooking.periodicBookingStartingYear)
                                            .format('dddd'),
                        'dateStart' :   moment()
                                            .date(periodicBooking.periodicBookingStartingDay)
                                            .month(periodicBooking.periodicBookingStartingMonth)
                                            .year(periodicBooking.periodicBookingStartingYear)
                                            .format('ddd DD-MM-YYYY'),
                        'dateEnd'    :  moment()
                                            .date(periodicBooking.periodicBookingStartingDay)
                                            .month(periodicBooking.periodicBookingStartingMonth)
                                            .year(periodicBooking.periodicBookingStartingYear)
                                            .add(periodicBooking.periodicBookingWeeksDuration,'week')
                                            .format('ddd DD-MM-YYYY'),
                        'scheduleStart': (periodicBooking.periodicBookingScheduleStart+'h')
                                            .replace('.5h', 'h30'),
                        'scheduleEnd' :  (periodicBooking.periodicBookingScheduleEnd+'h')
                                            .replace('.5h', 'h30'),
                        'periodicBookingWeeksDuration' : periodicBooking.periodicBookingWeeksDuration,
                        'id'            : periodicBooking.id,
                        'room'          : periodicBooking.room,
                        'isValidated'   : periodicBooking.isValidated,
                        'bookedBy'  : periodicBooking.bookedBy

                    };
                    $scope.formattedPeriodicBookings.push(formatPeriodicBooking);
                } catch (e) {
                    $scope.error = e;
                    $timeout($scope.removeErrorMessage, $scope.timeoutTime);
                }
            }

        };

        this.addPeriodicBooking = function () {
            $scope.dataLoading = true;
            var newPeriodicBooking = {
                    'periodicBookingStartingDay' : this.periodicBookingStartingDay,
                    'periodicBookingScheduleStart' : this.periodicBookingScheduleStart,
                    'periodicBookingScheduleEnd' : this.periodicBookingScheduleEnd,
                    'periodicBookingStartingMonth' : this.selectedStartMonth,
                    'periodicBookingStartingYear' : this.selectedStartYear,
                    'periodicBookingWeeksDuration' : this.periodicBookingWeeksDuration,
                    'room' : this.periodicBookingRoom
                };
            databaseService.addPeriodicBookingDB(newPeriodicBooking, $scope.username, $scope.authToken)
                .then(function() {
                    $scope.error = undefined;
                    $scope.dataLoading = false;
                    $scope.getPeriodicBookings();
                    $scope.message = 'Réservation périodique soumise.';
                    $timeout($scope.removeMessage, $scope.timeoutTime);
                },$scope.handleErrorDBCallback);
        };

        this.deletePeriodicBooking = function(periodicBookingID) {
            $scope.dataLoading = true;

             databaseService.getPeriodicBookingDB(periodicBookingID, $scope.authToken)
                .then(function(response) {
                    var currentWeek = moment().isoWeek();
                    var periodicBooking  = response.data;
                    var dayStr = moment().date(periodicBooking.periodicBookingStartingDay)
                                            .month(periodicBooking.periodicBookingStartingMonth)
                                            .year(periodicBooking.periodicBookingStartingYear)
                                            .format('ddd');
                    var dayStarted = moment().date(periodicBooking.periodicBookingStartingDay)
                                            .month(periodicBooking.periodicBookingStartingMonth)
                                            .year(periodicBooking.periodicBookingStartingYear);

                    //I added the -1 to mark the current week as ellapsed
                    var ellapsedWeeks = moment().isoWeek() - dayStarted.isoWeek() - 1;
                    var leftWeekDuration = periodicBooking.periodicBookingWeeksDuration - ellapsedWeeks;
                    databaseService.deletePeriodicBookingDB(periodicBookingID, $scope.username,
                                                currentWeek, dayStr, leftWeekDuration, $scope.authToken)
                    .then(function() {
                        $scope.error = undefined;
                        $scope.dataLoading = false;
                        $scope.getPeriodicBookings();
                        $scope.message = 'Réservation périodique supprimée.';
                        $timeout($scope.removeMessage, $scope.timeoutTime);
                    },$scope.handleErrorDBCallback);$scope.formatPeriodicBookings();
            },$scope.handleErrorDBCallback);
            
        };

        this.findConflictedSlotsWithPerdiodicBooking = function (periodicBookingID){
            $scope.bookingConflitLoading[periodicBookingID] = true;
            $scope.nbConflicts[periodicBookingID] = 0;
            $scope.nbQueriesConflicts[periodicBookingID] = 0;
            $scope.bookingsSharingSlotToBeCancelled[periodicBookingID] = [];
            databaseService.getPeriodicBookingDB(periodicBookingID, $scope.authToken)
                .then(function(response) {
                    $scope.bookingsSharingSlotToBeCancelled[periodicBookingID] = [];       
                    var periodicBooking = response.data;
                    var periodicBookingWeeksDuration = parseInt(periodicBooking.periodicBookingWeeksDuration);
                    var newBookingDate = moment()
                                            .date(periodicBooking.periodicBookingStartingDay)
                                            .month(periodicBooking.periodicBookingStartingMonth)
                                            .year(periodicBooking.periodicBookingStartingYear);

                    for(var i = 0; i <= periodicBookingWeeksDuration; i++){
                        var newBooking = {
                            room: periodicBooking.room,
                            scheduleStart: periodicBooking.periodicBookingScheduleStart,
                            scheduleEnd: periodicBooking.periodicBookingScheduleEnd,
                            day: newBookingDate.format('ddd DD-MM-YYYY'),
                            week: newBookingDate.week(),
                            year: newBookingDate.year(),
                            bookedBy: periodicBooking.bookedBy,
                            isValidated: true,
                            isPeriodic: true
                        };
                        $scope.nbQueriesConflicts[periodicBookingID]++;
                        databaseService.getConflictedBookingsDB(newBooking)
                            .then($scope.getConflictedBookingsDBCallback(periodicBookingID),
                                $scope.handleErrorDBCallback);
                        newBookingDate.add(1, 'week');
                    }
                },$scope.handleErrorDBCallback);
        };

        $scope.getConflictedBookingsDBCallback = function(periodicBookingID){
            return (function(response){
                var conflictedBookings = response.data;
                $scope.nbConflicts[periodicBookingID] += conflictedBookings === undefined ?
                                                         0 : conflictedBookings.length;
                $scope.bookingsSharingSlotToBeCancelled[periodicBookingID].push(conflictedBookings);
                $scope.nbQueriesConflicts[periodicBookingID]--;
                if($scope.nbQueriesConflicts[periodicBookingID] <= 0) {
                    $scope.bookingConflitLoading[periodicBookingID] = false;
                    $scope.bookingsSharingSlotToBeCancelled[periodicBookingID] = $scope.mergeBookingsSharingSlotToBeCancelled($scope.bookingsSharingSlotToBeCancelled[periodicBookingID]);
                }
            });       
        };

        $scope.mergeBookingsSharingSlotToBeCancelled = function(bookingsSharingSlot) {
            var mergedBookingSharing = [];
            for(var i = 0; i < bookingsSharingSlot.length; i++){
                var innerBookingsSharingSlot = bookingsSharingSlot[i];
                for (var j = 0; j < innerBookingsSharingSlot.length; j++){
                    mergedBookingSharing.push(innerBookingsSharingSlot[j]);
                }
            }

            return mergedBookingSharing;
            
        };

        this.validatePeriodicBooking = function(periodicBookingID) {
            $scope.dataLoading = true;
            databaseService.validatePeriodicBookingDB(periodicBookingID, $scope.username, $scope.authToken)
                .then(function() {
                    $scope.error = undefined;
                    $scope.propagatePerdiodicBookingValidation(periodicBookingID);
                    $scope.getPeriodicBookings();
                    databaseService.getPeriodicBookingDB(periodicBookingID, $scope.authToken)
                        .then(function(response) {
                            $scope.sendConfirmationEmail(response.data);
                        }, $scope.handleErrorDBCallback);
                    $scope.message = 'Réservation périodique validée.';
                    $timeout($scope.removeMessage, $scope.timeoutTime);
                }, $scope.handleErrorDBCallback);
        };


        $scope.propagatePerdiodicBookingValidation = function(periodicBookingID) {
            $scope.nbQueriesPropagate[periodicBookingID] = 0;
            databaseService.getPeriodicBookingDB(periodicBookingID, $scope.authToken)
                .then(function(response) {
                    var periodicBooking = response.data;
                    var newBookingDate = moment()
                                            .date(periodicBooking.periodicBookingStartingDay)
                                            .month(periodicBooking.periodicBookingStartingMonth)
                                            .year(periodicBooking.periodicBookingStartingYear);

                    commonService.sendCancelationEmails(periodicBooking.id, $scope.authToken,
                        $scope.bookingsSharingSlotToBeCancelled[periodicBookingID],
                      'CANCEL_EMAIL_SUBJECT', 'CANCEL_EMAIL_BODY', $scope.handleErrorDBCallback);

                    commonService.cancelConflictedBookings($scope.authToken, periodicBooking.id,
                        $scope.bookingsSharingSlotToBeCancelled[periodicBookingID], $scope.emptyFunction,
                         $scope.handleErrorDBCallback);

                    for(var i = 0; i <= periodicBooking.periodicBookingWeeksDuration; i++){
                        $scope.dataLoading = true;
                        var newBooking = {
                            room: periodicBooking.room,
                            scheduleStart: periodicBooking.periodicBookingScheduleStart,
                            scheduleEnd: periodicBooking.periodicBookingScheduleEnd,
                            day: newBookingDate.format('ddd DD-MM-YYYY'),
                            week: newBookingDate.week(),
                            year: newBookingDate.year(),
                            bookedBy: periodicBooking.bookedBy,
                            isValidated: true,
                            isPeriodic: true
                        };
                        newBookingDate.add(1, 'week');
                        $scope.nbQueriesPropagate[periodicBookingID]++;
                        databaseService.addBookingDB(newBooking, $scope.authToken)
                            .then($scope.addBookingDBCallback(newBooking, periodicBookingID),$scope.handleErrorDBCallback);   
                    }
                    
                    sharedService.prepForNewBookingAddedBroadcast();
                },$scope.handleErrorDBCallback);
        };

        $scope.addBookingDBCallback = function(newBooking, periodicBookingID){
            return (function (response) {
                    newBooking.id = response.data.id;
                    commonService.validateBooking(newBooking, $scope.authToken, 
                        null, $scope.callerName , $scope.handleErrorDBCallback);
                    $scope.nbQueriesPropagate[periodicBookingID]--;
                    if($scope.nbQueriesPropagate[periodicBookingID] <= 0){
                        $scope.dataLoading = false;
                    }
            });       
        };

        $scope.emptyFunction = function() {

        };

        $scope.sendConfirmationEmail = function(periodicBooking){
            databaseService.getBookerEmailDB($scope.username, $scope.authToken).
            then(function(response) {
                var to = response.data.email;
                var from = 'admin@admin.fr';
                var cc = '';
                var periodicBookingScheduleStart = (periodicBooking.periodicBookingScheduleStart+'h').replace('.5h', 'h30');
                var periodicBookingScheduleEnd = (periodicBooking.periodicBookingScheduleEnd+'h').replace('.5h', 'h30');
                var subject = globalizationService.getLocalizedString('VALIDATION_PERIODIC_BOOKING_EMAIL_SUBJECT');
                var body = globalizationService.getLocalizedString('VALIDATION_PERIODIC_BOOKING_EMAIL_BODY');
                subject = subject.replace('<BOOKING_DAY>', periodicBooking.periodicBookingStartingDay)
                    .replace('<BOOKING_SCHEDULE_START>', periodicBookingScheduleStart)
                    .replace('<BOOKING_SCHEDULE_END>', periodicBookingScheduleEnd)
                    .replace('<BOOKING_WEEK_DURATION>', periodicBooking.periodicBookingWeeksDuration);

                body = body.replace('<BOOKING_DAY>', periodicBooking.periodicBookingStartingDay)
                    .replace('<BOOKING_SCHEDULE_START>', periodicBookingScheduleStart)
                    .replace('<BOOKING_SCHEDULE_END>', periodicBookingScheduleEnd)
                    .replace('<BOOKING_WEEK_DURATION>', periodicBooking.periodicBookingWeeksDuration);

                emailService.sendEmail(from, to, cc, subject, body, $scope.authToken);

            },$scope.handleErrorDBCallback);
        };

        this.initCalendar = function () {
          $scope.week = this.dateStart.week();
          $scope.year = this.dateStart.year();
          this.initWeek();
        };


        this.initWeek = function() {
          this.initWeekData(this.todayMonth, true, this.todayYear);
          this.initWeekData(this.todayMonth, false,  this.todayYear);
        };

        this.initWeekData = function (newMonth, isStartingDate, newYear) {
            var monthWeeksIndex = isStartingDate === true ? 0 : 1;

            var date = isStartingDate === true ? this.dateStart : this.dateEnd;
            date.month(newMonth);
            date.year(newYear);
            var firstMonthWeek = date.startOf('month').week();
            this.monthWeeks[monthWeeksIndex] = [];
            for(var i = 0; i < 6; i++){
                var monthDays =  [];
                var week = moment().week(firstMonthWeek + i);
                var weekNumber = week.week();
                week.startOf('week').date();
                for(var j = 0; j < 7; j++){
                    var day = week.date();
                    var month = week.month();
                    week.add(1, 'd');
                    monthDays.push({'day' :day, 'month': month});
                }
                var monthWeek = {'week': weekNumber,
                                      'monthDays': monthDays,
                                      'year': date.year()};
                this.monthWeeks[monthWeeksIndex].push(monthWeek);
                if(this.todayWeek === weekNumber){
                    this.currIndexOfWeeksArray = i;
                }
            }
        };

        this.selectStartingDay = function(monthDay, week, year){
            if(this.periodicBookingStartingDay !== undefined &&
                this.periodicBookingStartingWeek !== undefined &&
                this.periodicBookingStartingYear !== undefined) {

                if(monthDay.month !== this.selectedStartMonth){
                    this.initWeekData(monthDay.month, true, year);
                }
            }

            this.periodicBookingStartingDay = monthDay.day;
            this.periodicBookingStartingWeek = week;
            this.periodicBookingStartingYear = year;

            this.selectedStartDay = monthDay.day;
            this.selectedStartMonth = monthDay.month;
            this.selectedStartYear = year;

            this.selectedStartingDate = moment().date(this.periodicBookingStartingDay)
                                .week(this.periodicBookingStartingWeek)
                                .year(this.periodicBookingStartingYear).format('ddd DD-MM-YYYY');
            this.periodicDay = moment().date(this.periodicBookingStartingDay)
                                .week(this.periodicBookingStartingWeek)
                                .year(this.periodicBookingStartingYear).format('dddd');
            if(this.selectedEndDay !== undefined &&
                this.selectedEndWeek !== undefined &&
                this.selectedEndYear !== undefined) {
                var endingDay = moment().date(this.selectedEndDay)
                                    .week(this.selectedEndWeek)
                                    .year(this.selectedEndYear);
                var startingDay = moment().date(monthDay.day).week(week).year(year);
                this.periodicBookingWeeksDuration = endingDay.isoWeek() - startingDay.isoWeek();

            }

            

        };

        this.selectEndingDay = function(monthDay, week, year){
            if(this.selectedEndDay !== undefined &&
                this.selectedEndWeek !== undefined &&
                this.selectedEndYear !== undefined) {

                if(monthDay.month !== this.selectedEndMonth){
                    this.initWeekData(monthDay.month, false, year);
                }
            }

            this.selectedEndDay = monthDay.day;
            this.selectedEndMonth = monthDay.month;
            this.selectedEndWeek = week;
            this.selectedEndYear = year;

            this.selectedEndingDate = moment().date(this.selectedEndDay)
                                    .week(this.selectedEndWeek)
                                    .year(this.selectedEndYear).format('ddd DD-MM-YYYY');

            if(this.periodicBookingStartingDay !== undefined &&
                this.periodicBookingStartingWeek !== undefined &&
                this.periodicBookingStartingYear !== undefined) {
                var startingDay = moment().date(this.periodicBookingStartingDay)
                                    .week(this.periodicBookingStartingWeek)
                                    .year(this.periodicBookingStartingYear);
                var endingDay = moment().date(monthDay.day).week(week).year(year);

                
                this.periodicBookingWeeksDuration = endingDay.isoWeek() - startingDay.isoWeek(); 
            }
        };

        $scope.handleErrorDBCallback = function(response){
          $scope.handleErrorDB(response.status, response.data); 
        };

        $scope.handleErrorDB = function(status, data){
          if(data.errorCode === -1) {
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

        this.daysAreSelected = function() {
            return (this.selectedStartingDate !== undefined && 
                this.periodicBookingWeeksDuration !== undefined);
        };

    }]);