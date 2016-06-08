'use strict';

/**
 * @ngdoc function
 * @name calendarApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the calendarApp
 */
angular.module('calendarApp')
  .controller('MainCtrl', function ($scope, $http, moment, databaseService) {
    moment.locale('fr');

    $scope.calendar = [];
    $scope.booking = {};
    $scope.serverAddr = 'http://localhost/';
    $scope.week = '';
    $scope.year = '';
    $scope.weekStartEndDates = '';
    $scope.bookerColorsStyles = [];
    $scope.rooms = [];
    $scope.currentRoom = undefined;

    this.date = moment();
    this.todayMonth = undefined;
    this.todayWeek = this.date.week();
    this.colorOfSelectedBooking = '#FFCDD2';
    this.myColor = '#FBC02D';
    this.isMouseUp = true;
    this.bookingSlotSelectionIsGoingUp = false;
    this.isNewBookingSelected = false;
    this.isExistingBookingSelected = false;
    this.days = [];
    this.monthWeeks = [];
    this.currIndexOfWeeksArray = 0;
    this.originCurrTime = undefined;

  	this.schedulesLabels = ['0', '0:30', '1', '1:30', '2', '2:30', '3', '3:30', '4','4:30', '5', '5:30',
  	 '6', '6:30', '7', '7:30', '8', '8:30','9', '9:30', '10', '10:30', '11', '11:30', '12', '12:30',
  	 '13', '13:30', '14', '14:30', '15', '15:30', '16', '16:30', '17', '17:30', '18', '18:30',
  	 '19', '19:30', '20', '20:30', '21', '21:30', '22', '22:30', '23', '23:30', '0'];

    this.schedules = [0,0.5,1,1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10,
	   10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 
	   20, 20.5, 21, 21.5, 22, 22.5, 23, 23.5, 24];
    
    this.initCalendar = function () {
      $scope.week = this.date.week();
      $scope.year = this.date.year();
      this.initRooms();
      this.initBookers();
      this.initCalendarDays();
      this.initWeek();
    };

    this.initRooms = function() {
      databaseService.getRoomsDB($scope.serverAddr).then(function(data)
      {
        var rooms = data.data;
        $scope.rooms = rooms;
        $scope.currentRoom = rooms[0].room;
        $scope.initWeekBookings();
      },function(data, status){
        console.log(status);
        console.log(data);
      });
    };

    this.initBookers = function() {
      databaseService.getBookersDB($scope.serverAddr).then(function(data)
      {
        $scope.bookerColorsStyles = data.data;
      },function(data, status){
        console.log(status);
        console.log(data);
      });

    };

    $scope.initWeekBookings = function() {
      databaseService.getWeekBookingDB($scope.serverAddr, $scope.year,
                                         $scope.week, $scope.currentRoom).then(function(data)
      {
        $scope.calendar = data.data;
      },function(data, status){
        console.log(status);
        console.log(data);
      });
    };

    this.initCalendarDays = function () {
      this.days = [];
      this.date.week($scope.week);
      for(var i = 0; i < 7; i++) {
            this.days.push(this.date.weekday(i).format('ddd DD-MM-YYYY'));
          }
    };

    this.initWeek = function() {
      this.todayMonth = this.date.month();
      this.initWeekData(this.todayMonth);
      this.setWeek(this.currIndexOfWeeksArray);
    };

    this.initWeekData = function (newMonth) {
      var date = this.date.month(newMonth);
      var firstMonthWeek = date.startOf('month').week();
      this.monthWeeks = [];
      for(var i = 0; i < 6; i++){
        var monthDays =  [];
        var week = moment().week(firstMonthWeek + i);
        var weekNumber = week.week();
        week.startOf('week').date();
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
        if(this.todayWeek === weekNumber){
          this.currIndexOfWeeksArray = i;
        }
      }
    };

    this.setWeek = function(indexOfWeeksArray) {
      var weekData = this.monthWeeks[indexOfWeeksArray];
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
    };

    this.selectRoom = function(roomIndex) {
      $scope.currentRoom = $scope.rooms[roomIndex].room;
      $scope.initWeekBookings();
    };

    this.getBooking = function(day, week, year, currTime){
      var currTimeBooking = false;
      if($scope.calendar !== undefined) {
    		for (var i = 0; i < $scope.calendar.length; i++) {
       		var detail = $scope.calendar[i];
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

    this.mouseDown = function(day, week, year, currTime){
    	if(this.isMouseUp === true) {	
        this.isNewBookingSelected = true;
        this.isExistingBookingSelected = false;
    		this.isMouseUp = false;
    		this.createLocalBooking(day, week, year, currTime);
    	}
    };

    this.mouseUp = function() {
      this.isMouseUp = true;
      this.bookingSlotSelectionIsGoingUp = false;
    };

    this.mouseEnter = function (currTime, day) {
      if($scope.booking!== undefined &&
        day === $scope.booking.day &&
        this.isMouseUp === false) {       

        if(parseFloat(currTime) >= $scope.booking.scheduleStart &&
                this.bookingSlotSelectionIsGoingUp === false){
          $scope.booking.scheduleEnd = (parseFloat(currTime)+0.5)+'';
        }
        else {
          if (this.originCurrTime < parseFloat(currTime)){
              this.bookingSlotSelectionIsGoingUp = false;
            $scope.booking.scheduleStart = this.originCurrTime+'';
            $scope.booking.scheduleEnd = (parseFloat(currTime)+0.5)+'';
          }
          else {
            if(this.bookingSlotSelectionIsGoingUp === false ||
                $scope.booking.scheduleEnd === undefined) {
              $scope.booking.scheduleEnd = this.originCurrTime+0.5+'';
            }        
            $scope.booking.scheduleStart = (parseFloat(currTime))+'';
            this.bookingSlotSelectionIsGoingUp = true;
          }
        }
      }
    };

    this.selectBookingInDB = function(id) {
      databaseService.getBookingDB($scope.serverAddr, id).then(function (data) {
            var bookingDB = {};
            bookingDB.id             =   data[0].id;
            bookingDB.room           =   data[0].room;
            bookingDB.scheduleStart  =   parseFloat(data[0].scheduleStart)+'';
            bookingDB.scheduleEnd    =   parseFloat(data[0].scheduleEnd)+'';
            bookingDB.day            =   data[0].day;
            bookingDB.week           =   data[0].week;
            bookingDB.year           =   data[0].year;
            bookingDB.bookedBy       =   data[0].bookedBy;
            bookingDB.isValidated    =   data[0].isValidated;

            $scope.booking = bookingDB;
 
        }, function(data, status){
            console.log(status);
            console.log(data);
        });
      this.isNewBookingSelected = false;
      this.isExistingBookingSelected = true;
    };   

    this.createLocalBooking = function(day, week, year, currTime){
      $scope.booking.id = undefined;
      $scope.booking.scheduleEnd = undefined;
      $scope.booking.scheduleStart = currTime+'';
      $scope.booking.day = day;
      $scope.booking.bookedBy = $scope.booking.bookedBy === undefined ? ' ' : $scope.booking.bookedBy;
      this.originCurrTime = parseFloat(currTime);
      return false;
    };

    this.applyBookingColor = function(bookingForSchedule) {
      var split = bookingForSchedule.split('$');
      var color = this.getBookerColor(split[0]);
      if(split.length >= 2) {
        var bookingID = split[1];
        if($scope.booking !== undefined &&
          $scope.booking.id !== undefined &&
          $scope.booking.id === bookingID) {
          color = this.colorOfSelectedBooking;
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
          if(bookings[i].bookedBy !== undefined){
            var b = bookings[i];
            bookedBy.push(b.bookedBy+'$'+b.id);
          }
        }
      }
      if(this.isSelectBookingSlotClass(currTime, day) !== false){
        bookedBy.push($scope.booking.bookedBy+'$');
      }
      return bookedBy;
    };

    this.hasBookingForSlot = function(day, week, year, currTime) {
      var bookedBy = [];
      var bookings = this.getBooking(day, week, year, currTime);
      if(bookings !== false){
        for(var i = 0; i < bookings.length; i++){
          if(bookings[i].bookedBy !== undefined){
            var b = bookings[i];
            bookedBy.push(b.bookedBy+'$'+b.id);
          }
        }
      }
      return (bookedBy.length > 0);
    };

    this.isSelectBookingSlotClass = function(currTime, day) {
      var isInfo = false;
      var parsedCurrTime = parseFloat(currTime);
      if($scope.booking !== undefined && this.isNewBookingSelected === true){
          if($scope.booking.day === day){
            if(parseFloat($scope.booking.scheduleStart) === parsedCurrTime){
              isInfo = true;
            } else if (parseFloat($scope.booking.scheduleEnd) === (parsedCurrTime+0.5)){
              isInfo = true;
            } else if (parseFloat($scope.booking.scheduleEnd) >= (parsedCurrTime+0.5) && 
              parseFloat($scope.booking.scheduleStart) <= parsedCurrTime){
              isInfo = true;
            } 
        }
      }
      return isInfo;
    };


    this.addBooking = function() {
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
    databaseService.addBookingDB($scope.serverAddr, newBooking).then(function (data) {
          newBooking.id = data.id;
          $scope.calendar.push(newBooking);
        },function(data, status){
          console.log(status);
          console.log(data);
        });
              
    $scope.booking = {};
    };

    this.validateBooking = function () {
		  this.validateBookingDB();
    };
  });