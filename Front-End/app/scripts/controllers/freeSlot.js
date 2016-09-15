'use strict';

/**
 * @ngdoc function
 * @name calendarApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the calendarApp
 */
angular.module('calendarApp')
  .controller('freeSlotController', ['$scope', '$http','$location', '$cookies', '$timeout', 'moment', 'databaseService', 'sharedService', 'authenticationService',
  function ($scope, $http,$location,  $cookies, $timeout, moment, databaseService, sharedService, authenticationService) {
	moment.locale('fr');
  $scope.guestName = 'Visiteur';
  $scope.availableRooms = undefined;
	$scope.dataLoading = false;
  $scope.week = '';
  $scope.year = '';
  $scope.slotsStatuses = [];
  $scope.timeoutTime = 5000;
  $scope.userEmail = undefined;

  this.date = moment();
	this.scheduleStart = undefined;
	this.scheduleEnd = undefined;
  this.todayDate = this.date.date();
  this.todayWeek = this.date.week();
  this.todayMonth = this.date.month();
  this.todayYear = this.date.year();
  this.monthWeeks = [];
  this.selectedDay = this.todayDate;
  this.selectedMonth = this.todayMonth;
  this.selectedWeek = this.todayWeek;
  this.selectedYear = this.todayYear;
  this.day = this.date.format('ddd DD-MM-YYYY');

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

          if(($scope.userEmail === undefined || $scope.userEmail === '')&&
            $scope.guestName !== $scope.username) {
            $location.path('/userConsole');
          }
      });

	this.initSearch = function() {
    var globalsCookies = $cookies.getObject('globals');
      if(globalsCookies !== undefined) {
        $scope.authToken = globalsCookies.token;
        $scope.username = globalsCookies.username;
        $scope.isAdmin = globalsCookies.isAdmin;
      }
      if(($scope.userEmail === undefined || $scope.userEmail === '')&&
            $scope.guestName !== $scope.username) {
            $location.path('/userConsole');
      }
		this.initCalendar();
	};

    this.initCalendar = function () {
      $scope.week = this.date.week();
      $scope.year = this.date.year();
      this.initWeek();
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

      $scope.weekStartEndDates = weekData.monthDays[0].day + ' ' + 
                                weekData.monthDays[0].month +
                                ' - ' + 
                                weekData.monthDays[6].day + ' ' +
                                weekData.monthDays[6].month;
    };

    this.searchFreeSlot = function() {
    	$scope.dataLoading = true;
    	$scope.availableRooms = [];
      $scope.error = undefined;
    	databaseService.getFreeRoomsForSlot(this.day, this.scheduleStart, this.scheduleEnd).
    	then(function(data) {
    		var freeRooms = data.data;
        $scope.slotsStatuses = [];
    		for(var i = 0; i < freeRooms.length; i++){
    			$scope.availableRooms.push(freeRooms[i].freeRoom);
          $scope.slotsStatuses.push({'isLoadingData': false, 'isNewlyBooked': false});
    		}
    		$scope.dataLoading = false;
    	},$scope.handleErrorDBCallback);
    };

    this.selectDay = function(monthDay, week, year){
      if(this.selectedDay !== undefined &&
          this.selectedWeek !== undefined &&
          this.selectedYear !== undefined) {

          if(monthDay.month !== this.selectedMonth){
              this.initWeekData(monthDay.month, year);
          }
      }

      this.selectedDay = monthDay.day;
      this.selectedWeek = week;
      this.selectedMonth = monthDay.month;
      this.selectedYear = year;
      this.day = this.date.year(year).month(monthDay.month).date(monthDay.day).format('ddd DD-MM-YYYY');
    };

    this.bookFreeSlot = function(room, slotIndex) {
      var slotStatus = $scope.slotsStatuses[slotIndex];
      var booking = {
                'room'          : room,
                'scheduleStart' : this.scheduleStart,
                'scheduleEnd'   : this.scheduleEnd,
                'day'           : this.day,
                'week'          : this.selectedWeek,
                'year'          : this.selectedYear,
                'bookedBy'      : $scope.username
              };
      slotStatus.isLoadingData = true;
      databaseService.addBookingDB(booking, $scope.authToken).
      then(function(){
        slotStatus.isLoadingData = false;
        slotStatus.isNewlyBooked = true;
      },$scope.handleErrorDBCallback);
    };

    $scope.handleErrorDBCallback = function(response){
        $scope.handleErrorDB(response.status, response.data); 
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

    $scope.removeErrorMessage = function() {
      $scope.error = undefined;
    };

    $scope.removeAdminMessage = function() {
      $scope.messageAdmin = undefined;
    };

    $scope.removeMessage = function() {
      $scope.message = undefined;
    };

}]);