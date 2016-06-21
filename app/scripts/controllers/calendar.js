'use strict';

/**
 * @ngdoc function
 * @name calendarApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the calendarApp
 */
angular.module('calendarApp')
  .controller('calendarController', function ($scope, $http, $cookieStore, $timeout, $interval, moment, databaseService, sharedService, authenticationService, emailService) {
    moment.locale('fr');
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
    $scope.currentRoom = undefined;
    $scope.error = undefined;
    $scope.dataLoading = false;
    $scope.messageAdmin = undefined;
    $scope.message = undefined;
    $scope.timeoutTime = 10000;
    $scope.intervalRefreshCalendarTime = 60000;
    this.date = moment();
    this.todayMonth = this.date.month();
    this.todayWeek = this.date.week();
    this.todayYear = this.date.year();
    this.colorOfSelectedBooking = '#FFCDD2';
    this.isMouseUp = true;
    this.bookingSlotSelectionIsGoingUp = false;
    this.isNewBookingSelected = false;
    $scope.isExistingBookingSelected = false;
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

    var interval = $interval(function () { $scope.initWeekBookings();}, $scope.intervalRefreshCalendarTime);
    $scope.$on('$destroy', function () { $interval.cancel(interval); });
    this.initCalendar = function () {
      var globalsCookies = $cookieStore.get('globals');
      if(globalsCookies !== undefined) {
        $scope.authToken = globalsCookies.token;
        $scope.username = globalsCookies.username;
        $scope.isAdmin = globalsCookies.isAdmin;
      }
      $scope.booking.bookedBy = $scope.username === $scope.guestName ? undefined : $scope.username;
      $scope.week = this.date.week();
      $scope.year = this.date.year();
      this.initRooms();
      this.initBookers();
      this.initCalendarDays();
      this.initWeek();
    };

    this.initRooms = function() {
      databaseService.getRoomsDB().then(function(data)
      {
        var rooms = data.data;
        $scope.rooms = rooms;
        $scope.currentRoom = rooms[0].room;
        $scope.initWeekBookings();
        $scope.error = undefined;
      },function(response){
        $scope.handleErrorDB(response.status, response.data);
      });
    };

    this.initBookers = function() {
      databaseService.getBookersDB().then(function(data)
      {
        $scope.bookerColorsStyles = data.data;
        $scope.error = undefined;
      },function(response){
        $scope.handleErrorDB(response.status, response.data);
      });

    };

    $scope.initWeekBookings = function() {
      databaseService.getWeekBookingDB($scope.year, $scope.week,
        $scope.currentRoom).then(function(data)
      {
        $scope.calendar = data.data;
        $scope.error = undefined;
      },function(response){
        $scope.handleErrorDB(response.status, response.data);
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
      this.initWeekData(this.todayMonth, this.todayYear);
      this.setWeek(this.currIndexOfWeeksArray);
    };

    this.initWeekData = function (newMonth, newYear) {
      var date = this.date.month(newMonth);
      date.year(newYear);
      var firstMonthWeek = date.startOf('month').week();
      this.monthWeeks = [];
      //create the week before the month, the 4 weeks of the month and the week after the month
      for(var i = 0; i < 6; i++){
        var monthDays =  [];
        var week = moment().week(firstMonthWeek + i);
        var weekNumber = week.week();
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

              $scope.booking = bookingDB;
              $scope.error = undefined;
          }, function(response){
              $scope.handleErrorDB(response.status, response.data);
          });
        this.isNewBookingSelected = false;
        $scope.isExistingBookingSelected = true;
      }
    };   

    this.applyBookingColor = function(bookingForSchedule) {
      var bookedByAndBookingID = bookingForSchedule.split('$');
      var color = this.getBookerColor(bookedByAndBookingID[0]);
      if(bookedByAndBookingID.length >= 2 ) {
        var bookingID = bookedByAndBookingID[1];
        var isValidated = this.isBookingValidated(bookingID);
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
      //check if the user can select a slot
      if($scope.username !== undefined && $scope.username !== $scope.guestName) {
        var parsedCurrTime = parseFloat(currTime);
        //check if the current booking has just been created
        if($scope.booking !== undefined && this.isNewBookingSelected === true){
            //check the curernt booking day/schedule to know if the slot has to be colored
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
      }
      return isInfo;
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
        },function(response){
          $scope.handleErrorDB(response.status, response.data);
        });
              
      $scope.booking = {};
      $scope.booking.bookedBy = $scope.username === $scope.guestName ? undefined : $scope.username;
    };

    this.validateBooking = function () {
      var bookingToValidate = $scope.booking;
		  databaseService.validateBookingDB(bookingToValidate.id, $scope.authToken).then(function () {
        $scope.messageAdmin = "Réservation validé.";
        $scope.sendConfirmationEmail(bookingToValidate);
        $timeout(function () { $scope.messageAdmin = undefined; }, $scope.timeoutTime);
        bookingToValidate.isValidated = true;
          //remove booking on the sharing a slot with the validated booking
          var bookingsSharingSlot = $scope.getBookingsSharingSlot(bookingToValidate);
          if(bookingsSharingSlot !== false) {
            var bookingToValidateID = bookingToValidate.id;
            var bookingToRemoveIds= [];
            for (var i = 0; i < bookingsSharingSlot.length; i++){
              var bookingsSharingSlotID = bookingsSharingSlot[i].id;
              if(bookingToValidateID !== bookingsSharingSlotID){
                bookingToRemoveIds.push(bookingsSharingSlot[i].id);
              }
            }
            databaseService.deleteBookingsDB(bookingToRemoveIds, $scope.authToken)
              .then(function (){
                $scope.initWeekBookings();
              }, function (response) {
                  $scope.handleErrorDB(response.status, response.data);
              });
          }
        },function(response){
          $scope.handleErrorDB(response.status, response.data);          
        });
    };

    $scope.getBookingsSharingSlot = function (booking) {
      var bookingsSharingSlot = false;
      if($scope.calendar !== undefined && booking !== undefined) {
        var start = parseFloat(booking.scheduleStart);
        var bookingID = booking.id;
        var end = parseFloat(booking.scheduleEnd);
        for (var i = 0; i < $scope.calendar.length; i++) {
          var detail = $scope.calendar[i];
          var dStart = detail.scheduleStart;
          var dEnd = parseFloat(detail.scheduleEnd);
          if(bookingID !== detail.id &&
            booking.day === detail.day &&
            parseInt(booking.year) === parseInt(detail.year) &&
            dStart < end && start < dEnd) {
            if(bookingsSharingSlot === false){
              bookingsSharingSlot = [];
            }
            bookingsSharingSlot.push(angular.copy(detail));
          }
        }
      }
      return bookingsSharingSlot;
    };

    this.isBookingValidated = function(bookingId){
      var isValidated = false;
      var id = bookingId;
      for(var i = 0; i < $scope.calendar.length; i++){
        if($scope.calendar[i].id === id) {
          isValidated = $scope.calendar[i].isValidated;
          break;
        }
      }
      return isValidated;
    };

    this.deleteBooking = function() {
      databaseService.deleteBookingDB($scope.booking.id, $scope.username, $scope.authToken)
      .then( function(){
        $scope.initWeekBookings();
        $scope.message = "Réservation supprimée.";
        $timeout(function () { $scope.message = undefined; }, $scope.timeoutTime);
      }, function(response){
        $scope.handleErrorDB(response.status, response.data);
      });
    };


    this.getRowspanIntValue = function(rowspanString){
      return parseInt(rowspanString);
    };

    $scope.handleErrorDB = function(status, data){
      if(data !== undefined && 
          data.errorCode !== undefined && 
          data.errorCode === -1) {
        authenticationService.ClearCredentials();
      }
      $scope.dataLoading = false;
      $scope.error = data.error;
      $timeout(function () {  }, $scope.timeoutTime); 
    };

    $scope.sendConfirmationEmail = function(booking){
      databaseService.getBookerEmailDB(booking.bookedBy, $scope.authToken).
      then(function(response) {
        var to = response.data.email;
        var from = 'admin@admin.fr';
        var cc = '';
        var subject = "Réservation validée - le " + booking.day +
                      " de " + (booking.scheduleStart+'h').replace(".5h", "h30") +
                      " à " + (booking.scheduleEnd+'h').replace(".5h", "h30");
        var message = "Bonjour, <br>Nous avons le plaisir de vous informer que votre réservation du " +
          booking.day + " de " + (booking.scheduleStart+'h').replace(".5h", "h30") +
          " à " + (booking.scheduleEnd+'h').replace(".5h", "h30") + " est validée.<br>" +
          "Cordialement,<br>La Mairie. ";
        emailService.sendEmail(from, to, cc, subject, message, $scope.authToken);

      }, function(response){
        $scope.handleErrorDB(response.status, response.data);
      });
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