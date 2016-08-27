'use strict';

/**
 * @ngdoc function
 * @name calendarApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the calendarApp
 */
angular.module('calendarApp')
  .controller('calendarController', ['$scope', '$http', '$window', '$cookies', '$timeout', '$interval', 'moment', 'databaseService', 'sharedService', 'authenticationService', 'emailService', 'globalizationService', 'commonService',
  function ($scope, $http, $window, $cookies, $timeout, $interval, moment, databaseService, sharedService, authenticationService, emailService, globalizationService, commonService) {
    $scope.callerName = 'Calendar';
    $scope.guestName = 'Visiteur';
    $scope.colorOfValidatedBooking = '#4caf50';
    $scope.colorOfValidatedBookingSelected = '#8bc34a';
    $scope.calendar = [];
    $scope.booking = {};
    $scope.authToken = undefined;
    $scope.username = $scope.guestName;
    $scope.week = '';
    $scope.year = '';
    $scope.weekStartEndDates = '';
    $scope.bookerColorsStyles = [];
    $scope.rooms = [];
    $scope.buildingsRooms = {};
    $scope.currentRoom = undefined;
    $scope.currentBuilding = undefined;
    $scope.error = undefined;
    $scope.dataLoading = false;
    $scope.messageAdmin = undefined;
    $scope.message = undefined;
    $scope.timeoutTime = 10000;
    $scope.intervalRefreshCalendarTime = 60000;

    this.dateDisplay = moment();
    this.date = moment();

    this.numberOfDays = 7;

    this.dateDisplay.locale($window.navigator.userLanguage || $window.navigator.language);
    this.date.locale('fr');

    this.todayMonth = this.date.month();
    this.todayWeek = this.date.isoWeek();
    this.todayYear = this.date.year();
    this.colorOfSelectedBooking = '#FFCDD2';
    this.isMouseUp = true;
    this.bookingSlotSelectionIsGoingUp = false;
    this.isNewBookingSelected = false;
    $scope.isExistingBookingSelected = false;

    this.daysDisplay = [];
    this.days = [];

    this.monthWeeks = [];
    this.currIndexOfWeeksArray = 0;
    this.originCurrTime = undefined;
    this.aleardyDisplayedBookings = [];

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
          $scope.username = $scope.username === undefined ? $scope.guestName : $scope.username;
          $scope.isAdmin = message.isAdmin;
          $scope.authToken = message.token;
          $scope.booking.bookedBy = $scope.username === $scope.guestName ? undefined : $scope.username;
      });

     $scope.$on('newBookingsAddedBroadcast', function() {
          $scope.initWeekBookings();
      });

    var interval = $interval(function () { $scope.initWeekBookings();}, $scope.intervalRefreshCalendarTime);
    $scope.$on('$destroy', function () { $interval.cancel(interval); });
    this.initCalendar = function () {
      var globalsCookies = $cookies.get('globals');
      if(globalsCookies !== undefined) {
        $scope.authToken = globalsCookies.token;
        $scope.username = globalsCookies.username;
        $scope.isAdmin = globalsCookies.isAdmin;
      }
      $scope.booking.bookedBy = $scope.username === $scope.guestName ? undefined : $scope.username;
      $scope.week = this.date.isoWeek();
      $scope.year = this.date.year();
      this.initRooms();
      this.initBookers();
      this.initCalendarDays();
      this.initWeeks();
    };

    this.initRooms = function() {
      databaseService.getRoomsDB().then(function(data)
      {
        var rooms = data.data;
        if(rooms !== undefined && rooms.length > 0){
          $scope.rooms = rooms;
          $scope.currentRoom = rooms[0].room;
          $scope.currentBuilding = $scope.rooms[0].building;
          $scope.initWeekBookings();
          $scope.initBuildingsRooms();
          $scope.error = undefined;
        }
      },$scope.handleErrorDBCallback);
    };

    $scope.initBuildingsRooms = function() {
      $scope.buildingsRooms = {};
      for(var i = 0; i < $scope.rooms.length; i++){
        var room = $scope.rooms[i];
        if($scope.buildingsRooms[room.building] === undefined){
          $scope.buildingsRooms[room.building] = {'buildingRooms': []};
        }
        $scope.buildingsRooms[room.building].buildingRooms.push(room.room);  
        
      }
    };

    this.initBookers = function() {
      databaseService.getBookersDB().then(function(data)
      {
        $scope.bookerColorsStyles = data.data;
        $scope.error = undefined;
      },$scope.handleErrorDBCallback);

    };

    $scope.initWeekBookings = function() {
      databaseService.getWeekBookingDB($scope.year, $scope.week,
        $scope.currentRoom).then(function(data)
      {
        $scope.calendar = data.data;
        $scope.error = undefined;
      },$scope.handleErrorDBCallback);
    };

    this.initCalendarDays = function () {
      this.days = [];
      this.date.isoWeek($scope.week);
      for(var i = 1; i <= this.numberOfDays; i++) {
        this.days.push(this.date.isoWeekday(i).format('ddd DD-MM-YYYY'));
      }
      this.daysDisplay = [];
      this.dateDisplay.isoWeek($scope.week);
      for(var j = 1; j <= this.numberOfDays; j++) {
        this.daysDisplay.push(this.dateDisplay.isoWeekday(j).format('ddd DD-MM-YYYY'));
      }
    };

    this.initWeeks = function() {
      this.initMonthData(this.todayMonth, this.todayYear);
      this.setWeek(this.currIndexOfWeeksArray);
    };

    this.initMonthData = function (newMonth, newYear) {
      var date = this.date.month(newMonth);
      this.dateDisplay.month(newMonth);
      date.year(newYear);
      var firstMonthWeek = date.startOf('month').isoWeek();
      this.monthWeeks = [];
      //create the week before the month, the 4 weeks of the month and the week after the month
      for(var i = 0; i < 6; i++){
        var monthDays =  [];
        var week = moment().week(firstMonthWeek + i);
        var weekNumber = week.isoWeek();
        week.startOf('week').date();
        //create the days of the week
        for(var j = 0; j < 7; j++){
          var day = week.date();
          var month = week.format('MMM');
          week.add(1, 'd');
          monthDays.push({'day' :day, 'month': month});
        }
        var monthWeek = {'week': weekNumber,
                              'monthDays': monthDays,
                              'year': date.year()};
        this.monthWeeks.push(monthWeek);
        if(this.todayWeek === weekNumber && this.todayYear === date.year()){
          this.currIndexOfWeeksArray = i;
        }
      }
    };

    this.setWeek = function(indexOfWeeksArray) {
      var weekData = this.monthWeeks[indexOfWeeksArray];
      var newWeekDate = moment().isoWeek(weekData.week).year(weekData.year);
      var currentWeekDate = moment().isoWeek($scope.week).year($scope.year);
      //if we go to next month, re-init the data
      if(newWeekDate.month() !== currentWeekDate.month()){
        this.initMonthData(newWeekDate.month(), newWeekDate.year());
        $scope.week = newWeekDate.isoWeek();
        $scope.year = newWeekDate.year();
        this.initCalendarDays();
        if($scope.currentRoom !== undefined){
          $scope.initWeekBookings();
        }

        $scope.weekStartEndDates = newWeekDate.isoWeekday(1).format('DD') + ' ' + 
                                newWeekDate.format('MMMM') +
                                ' - ' + 
                                newWeekDate.isoWeekday(7).format('DD') + ' ' +
                                newWeekDate.format('MMMM');
      } else {
        $scope.week = weekData.week;
        $scope.year = weekData.year;
        this.initCalendarDays();
        if($scope.currentRoom !== undefined){
          $scope.initWeekBookings();
        }
        $scope.weekStartEndDates = weekData.monthDays[0].day + ' ' + 
                                  weekData.monthDays[0].month +
                                  ' - ' + 
                                  weekData.monthDays[6].day + ' ' +
                                  weekData.monthDays[6].month;
      }   
    };

    this.selectRoom = function(room, building) {
      $scope.currentRoom = room;
      $scope.currentBuilding = building;
      $scope.initWeekBookings();
    };

    this.getBooking = function(day, week, year, currTime){
      var currTimeBooking = false;
      if($scope.calendar !== undefined) {
    		for (var i = 0; i < $scope.calendar.length; i++) {
       		var detail = $scope.calendar[i];
          //add the booking to the list if the slot match the current booking
    			if(day === detail.day &&
    				year === parseInt(detail.year) &&
    				currTime >= parseFloat(detail.scheduleStart) &&
    				currTime < parseFloat(detail.scheduleEnd)) {
            if(currTimeBooking === false){
              currTimeBooking = [];
            }
    				currTimeBooking.push(angular.copy(detail));
    			}
    		}
      }
  		return currTimeBooking;
    };    

    this.createLocalBooking = function(day, week, year, currTime){
      $scope.booking.id = undefined;
      $scope.booking.scheduleEnd = currTime+0.5+'';
      $scope.booking.scheduleStart = currTime+'';
      $scope.booking.day = day;
      $scope.booking.isValidated = false;
      $scope.booking.isPeriodic = false;
      $scope.booking.bookedBy = $scope.booking.bookedBy === undefined ? ' ' : $scope.booking.bookedBy;
      //store the origin slot time selected to know if the selection direction
      this.originCurrTime = parseFloat(currTime);
    };

    this.mouseDown = function(day, week, year, currTime){
      //if the user is authenticated and the user clicks on a slot
    	if($scope.username !== undefined &&
          $scope.username !== $scope.guestName &&
          this.isMouseUp === true) {	
        //the user is creating a new booking
        this.isNewBookingSelected = true;
        $scope.isExistingBookingSelected = false;
        //the mouse is not up
    		this.isMouseUp = false;
        //create the new booking with the first slot selected
    		this.createLocalBooking(day, week, year, currTime);
    	}
    };

    this.mouseUp = function() {
      //the mouse is up, stop the new booking schedules
      this.isMouseUp = true;
      this.bookingSlotSelectionIsGoingUp = false;
    };

    this.mouseEnter = function (currTime, day) {

      //if the user is authenticated and a creation of booking is in progress
      if($scope.username !== undefined &&
          $scope.username !== $scope.guestName && 
          this.isMouseUp === false && $scope.booking.day === day) {     
        //check if the slot selected is after the schedule start
        // and that the selection is going downwards
        if(parseFloat(currTime) >= $scope.booking.scheduleStart &&
                this.bookingSlotSelectionIsGoingUp === false){
          //set the new end of schedule
          $scope.booking.scheduleEnd = (parseFloat(currTime)+0.5)+'';
        }
        //the selection is currently going upwards
        else {
          //check is the selection direction has not gone from  upwards to downwards
          if (this.originCurrTime < parseFloat(currTime)){
              this.bookingSlotSelectionIsGoingUp = false;
            $scope.booking.scheduleStart = this.originCurrTime+'';
            $scope.booking.scheduleEnd = (parseFloat(currTime)+0.5)+'';
          }
          else {
            //check if the direction has just changed
            if(this.bookingSlotSelectionIsGoingUp === false ||
                $scope.booking.scheduleEnd === undefined) {
              $scope.booking.scheduleEnd = this.originCurrTime+0.5+'';
            }   
            //set the new start of schedule
            $scope.booking.scheduleStart = (parseFloat(currTime))+'';
            this.bookingSlotSelectionIsGoingUp = true;
          }
        }
      }
    };

    this.selectBookingInDB = function(id) {
      if(id !== undefined && id !== ''){
        databaseService.getBookingDB(id).then(function (dataDB) {
              var bookingDB = {};
              var data = dataDB.data;
              bookingDB.id             =   data.id;
              bookingDB.room           =   data.room;
              bookingDB.scheduleStart  =   parseFloat(data.scheduleStart)+'';
              bookingDB.scheduleEnd    =   parseFloat(data.scheduleEnd)+'';
              bookingDB.day            =   data.day;
              bookingDB.week           =   data.week;
              bookingDB.year           =   data.year;
              bookingDB.bookedBy       =   data.bookedBy;
              bookingDB.isValidated    =   data.isValidated;
              bookingDB.isPeriodic     =   data.isPeriodic;

              $scope.booking = bookingDB;
              $scope.error = undefined;
          },$scope.handleErrorDBCallback);
        this.isNewBookingSelected = false;
        $scope.isExistingBookingSelected = true;
      }
    };   

    this.applyBookingColor = function(bookingForSchedule) {
      var bookedByAndBookingID = bookingForSchedule.split('$');
      var color = this.getBookerColor(bookedByAndBookingID[0]);
      if(bookedByAndBookingID.length >= 2 ) {
        var bookingID = bookedByAndBookingID[1];
        var isValidated = this.isBookingValidated(bookingID, $scope.calendar);
        if($scope.booking !== undefined &&
          $scope.booking !== undefined &&
          $scope.booking.id !== undefined &&
          $scope.booking.id === bookingID ) {          
            color = isValidated ? $scope.colorOfValidatedBookingSelected : this.colorOfSelectedBooking;
        } 
      }
      return color;
    };

    this.getBookerColor = function(booker) {
      var color;
      for(var i = 0; i < $scope.bookerColorsStyles.length && color === undefined; i++) {
        if(booker === $scope.bookerColorsStyles[i].booker) {
          color = $scope.bookerColorsStyles[i].color;
        }
      }
      if(color === undefined){
        color = $scope.bookerColorsStyles[0].color;
      }
      return (color);
    };

    this.getScheduleBookedBy = function(day, week, year, currTime){
      var bookedBy = [];
      var bookings = this.getBooking(day, week, year, currTime);
      if(bookings !== false){
        for(var i = 0; i < bookings.length; i++){
          if(bookings[i].bookedBy !== undefined ){
            var b = bookings[i];
            var nbSlots = (parseFloat(b.scheduleEnd) - parseFloat(b.scheduleStart)) * 2.0;
            //We have to pass a string to avoid ifinite digest error while using object
            var bookedByString = b.bookedBy+'$'+b.id+'$'+nbSlots;
            bookedBy.push(bookedByString);            
          }
        }
      }
      if(this.isSelectBookingSlotClass(currTime, day) !== false){
        bookedBy.push($scope.username+'$');
      }
      return bookedBy;
    };

    this.isFreeSlot = function(day, week, year, currTime) {
      var isFreeSlot = true;
      //get the bookings for the slot
      var bookings = this.getBooking(day, week, year, currTime);
      if(bookings !== false){
        for(var i = 0; i < bookings.length && isFreeSlot; i++){
          if(bookings[i].bookedBy !== undefined){
            isFreeSlot = false;
          }
        }
      }
      return isFreeSlot;
    };

    this.isSelectBookingSlotClass = function(currTime, day) {
      var isSelectBookingSlot = false;
      //check if the user can select a slot
      if($scope.username !== undefined && $scope.username !== $scope.guestName) {
        var parsedCurrTime = parseFloat(currTime);
        //check if the current booking has just been created
        if($scope.booking !== undefined && this.isNewBookingSelected === true){
            //check the curernt booking day/schedule to know if the slot has to be colored
            if($scope.booking.day === day){
              if(parseFloat($scope.booking.scheduleStart) === parsedCurrTime){
                isSelectBookingSlot = true;
              } else if (parseFloat($scope.booking.scheduleEnd) === (parsedCurrTime+0.5)){
                isSelectBookingSlot = true;
              } else if (parseFloat($scope.booking.scheduleEnd) >= (parsedCurrTime+0.5) && 
                parseFloat($scope.booking.scheduleStart) <= parsedCurrTime){
                isSelectBookingSlot = true;
              } 
          }
        }
      }
      return isSelectBookingSlot;
    };


    this.addBooking = function() {
      $scope.booking.bookedBy = $scope.username === $scope.guestName ? undefined : $scope.username;
      var newBooking = {
        room: $scope.currentRoom,
        scheduleStart: $scope.booking.scheduleStart,
        scheduleEnd: $scope.booking.scheduleEnd,
        day: $scope.booking.day,
        week: $scope.week,
        year: $scope.year,
        bookedBy: $scope.booking.bookedBy,
        isValidated: $scope.booking.isValidated
      };
      $scope.dataLoading = true;
      databaseService.addBookingDB(newBooking, $scope.authToken).then(function (data) {
          newBooking.id = data.data.id;
          $scope.calendar.push(newBooking);
          $scope.dataLoading = false;
          $scope.error = undefined;
        },$scope.handleErrorDBCallback);
              
      $scope.booking = {};
      $scope.booking.bookedBy = $scope.username === $scope.guestName ? undefined : $scope.username;
    };

    this.validateBooking = function () {
      commonService.validateBooking($scope.booking, $scope.authToken,
        $scope.calendar, $scope.callerName, $scope.handleErrorDBCallback);
    };

    $scope.propagateBookingValidation = function() {
      if($scope.callerName === sharedService.callerName){
        var booking = sharedService.booking;
        var calendar = sharedService.calendar;
        var bookingsSharingSlotToBeCancelled = [];

        commonService.getBookingsSharingSlot(booking, calendar, bookingsSharingSlotToBeCancelled);
        commonService.sendEmails(booking, bookingsSharingSlotToBeCancelled, $scope.authToken,
                'VALIDATION_EMAIL_SUBJECT', 'VALIDATION_EMAIL_BODY',
                'CANCEL_EMAIL_SUBJECT', 'CANCEL_EMAIL_BODY', $scope.handleErrorDBCallback);
        commonService.cancelConflictedBookings($scope.authToken ,booking.id,
          bookingsSharingSlotToBeCancelled, $scope.initWeekBookings, $scope.handleErrorDBCallback);
        $scope.messageAdmin = globalizationService.getLocalizedString('CALENDAR_BOOKING_VALIDATED_MSG');
        $scope.dataLoading = false;
      }
    };

    $scope.$on('BookingValidated', $scope.propagateBookingValidation);


    this.isBookingValidated = function(bookingId, calendar){
      var isValidated = false;
      if(calendar !== undefined && calendar !== []) {
        for(var i = 0; i < calendar.length; i++){
          if(calendar[i].id === bookingId) {
            isValidated = calendar[i].isValidated;
            break;
          }
        }
      }
      return isValidated;
    };

    this.deleteBooking = function() {
      $scope.dataLoading = true;
      databaseService.deleteBookingDB($scope.booking.id, $scope.username, $scope.authToken)
      .then( function(){
        $scope.dataLoading = false;
        $scope.initWeekBookings();
        $scope.message = globalizationService.getLocalizedString('CALENDAR_BOOKING_DELETED_MSG');
        $timeout($scope.removeMessage, $scope.timeoutTime);
      },$scope.handleErrorDBCallback);
    };


    $scope.handleErrorDBCallback = function(response){
        if(response === undefined){
          response = {};
          response.data = undefined;
          response.status = undefined;
        }
        $scope.handleErrorDB(response.status, response.data); 
    };

    $scope.handleErrorDB = function(status, data){

      if(data !== undefined && data !== null) {
        authenticationService.ClearCredentials();
        $scope.error = data.error;
      } else {
        $scope.error = 'Unexpected error';
      }
      $scope.dataLoading = false;
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
