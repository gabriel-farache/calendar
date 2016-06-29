'use strict';

angular
    .module('calendarApp')
    .controller('periodicBookingController', function PeriodicBookingController($scope, $cookieStore, $timeout, $location, moment, sharedService, databaseService, globalizationService, emailService, authenticationService) {
        moment.locale('fr');
        $scope.dataLoading = false;
        $scope.week = '';
        $scope.year = '';
        $scope.isAdmin = false;
        $scope.periodicBookings  =[];
        $scope.timeoutTime = 5000;
        $scope.rooms = [];

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
        this.selectedDay = this.todayDate;
        this.selectedMonth = this.todayMonth;
        this.selectedWeek = this.todayWeek;
        this.selectedYear = this.todayYear;
        this.day = this.dateStart.format('ddd DD-MM-YYYY');
        this.selectedStartDay = undefined;
        this.selectedStartMonth = undefined;
        this.selectedStartYear = undefined;
        this.selectedEndDay = undefined;
        this.selectedEndMonth = undefined;
        this.selectedEndYear = undefined;

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

        var globalsCookies = $cookieStore.get('globals');
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
          },function(response){
            $scope.handleErrorDB(response.status, response.data);
          });
        };

        $scope.getPeriodicBookings = function() {
            $scope.dataLoading = true;
            $scope.periodicBookings  =[];
            databaseService.getPeriodicBookingsDB($scope.username, $scope.authToken)
                .then(function(response) {
                    $scope.error = undefined;
                    $scope.dataLoading = false;
                    $scope.periodicBookings  = response.data;
                    console.log($scope.periodicBookings);
                }, function(response){
                    $scope.handleErrorDB(response.status, response.data);
                });
        };

        this.addPeriodicBooking = function () {
            $scope.dataLoading = true;
            var newPeriodicBooking = {
                    "periodicBookingStartingDay" : this.periodicBookingStartingDay,
                    "periodicBookingScheduleStart" : this.periodicBookingScheduleStart,
                    "periodicBookingScheduleEnd" : this.periodicBookingScheduleEnd,
                    "periodicBookingStartingMonth" : this.selectedStartMonth,
                    "periodicBookingStartingYear" : this.selectedStartYear,
                    "periodicBookingWeeksDuration" : this.periodicBookingWeeksDuration,
                    "room" : this.periodicBookingRoom
                };
            databaseService.addPeriodicBookingDB(newPeriodicBooking, $scope.username, $scope.authToken)
                .then(function() {
                    $scope.error = undefined;
                    $scope.dataLoading = false;
                    $scope.periodicBookings.push(newPeriodicBooking);
                    $scope.message = "Réservation périodique soumise.";
                    $timeout(function () { $scope.message = undefined; }, $scope.timeoutTime);
                }, function(response){
                    $scope.dataLoading = false;
                    $scope.handleErrorDB(response.status, response.data);
                });
        };

        this.deletePeriodicBooking = function(periodicBooking) {
            $scope.dataLoading = true;
            databaseService.deletePeriodicBookingDB(periodicBooking.id, $scope.username, $scope.authToken)
                .then(function() {
                    $scope.error = undefined;
                    $scope.dataLoading = false;
                    $scope.getPeriodicBookings();
                    $scope.message = "Réservation périodique supprimée.";
                    $timeout(function () { $scope.message = undefined; }, $scope.timeoutTime);
                }, function(response){
                    $scope.dataLoading = false;
                    $scope.handleErrorDB(response.status, response.data);
                });
        };

        this.validatePeriodicBooking = function(periodicBooking) {
            $scope.dataLoading = true;
            databaseService.validatePeriodicBookingDB(periodicBooking.id, $scope.username, $scope.authToken)
                .then(function() {
                    $scope.error = undefined;
                    $scope.dataLoading = false;
                    $scope.getPeriodicBookings();
                    $scope.sendConfirmationEmail();
                    $scope.message = "Réservation périodique validée.";
                    $timeout(function () { $scope.message = undefined; }, $scope.timeoutTime);
                }, function(response){
                    $scope.dataLoading = false;
                    $scope.handleErrorDB(response.status, response.data);
                });
        };

        $scope.sendConfirmationEmail = function(periodicBooking){
            databaseService.getBookerEmailDB($scope.username, $scope.authToken).
            then(function(response) {
                var to = response.data.email;
                var from = 'admin@admin.fr';
                var cc = '';
                var periodicBookingScheduleStart = (periodicBooking.periodicBookingScheduleStart+'h').replace(".5h", "h30");
                var periodicBookingScheduleEnd = (periodicBooking.periodicBookingScheduleEnd+'h').replace(".5h", "h30");
                var subject = globalizationService.getLocalizedString("VALIDATION_PERIODIC_BOOKING_EMAIL_SUBJECT");
                var body = globalizationService.getLocalizedString("VALIDATION_PERIODIC_BOOKING_EMAIL_BODY");
                subject = subject.replace("<BOOKING_DAY>", periodicBooking.periodicBookingStartingDay)
                    .replace("<BOOKING_SCHEDULE_START>", periodicBookingScheduleStart)
                    .replace("<BOOKING_SCHEDULE_END>", periodicBookingScheduleEnd)
                    .replace("<BOOKING_WEEK_DURATION>", periodicBooking.periodicBookingWeeksDuration);

                body = body.replace("<BOOKING_DAY>", periodicBooking.periodicBookingStartingDay)
                    .replace("<BOOKING_SCHEDULE_START>", periodicBookingScheduleStart)
                    .replace("<BOOKING_SCHEDULE_END>", periodicBookingScheduleEnd)
                    .replace("<BOOKING_WEEK_DURATION>", periodicBooking.periodicBookingWeeksDuration);

                emailService.sendEmail(from, to, cc, subject, body, $scope.authToken);

            }, function(response){
                $scope.handleErrorDB(response.status, response.data);
            });
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
            this.periodicBookingStartingDay = monthDay.day;
            this.periodicBookingStartingWeek = week;
            this.periodicBookingStartingYear = year;

            this.selectedStartDay = monthDay.day;
            this.selectedStartMonth = monthDay.month;
            this.selectedStartYear = year;

        };

        this.selectEndingDay = function(monthDay, week, year){
            var startingDay = moment().date(this.periodicBookingStartingDay)
                                .week(this.periodicBookingStartingWeek)
                                .year(this.periodicBookingStartingYear);
            var endingDay = moment().date(monthDay.day).week(week).year(year);

            this.selectedEndDay = monthDay.day;
            this.selectedEndMonth = monthDay.month;
            this.selectedEndYear = year;
            this.periodicBookingWeeksDuration = endingDay.diff(startingDay, 'week');
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