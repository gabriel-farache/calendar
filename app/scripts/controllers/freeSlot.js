'use strict';

/**
 * @ngdoc function
 * @name calendarApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the calendarApp
 */
angular.module('calendarApp')
  .controller('freeSlotController', function ($scope, $http, $cookieStore, moment, databaseService) {
	moment.locale('fr');
  $scope.availableRooms = undefined;
	$scope.dataLoading = false;
  $scope.week = '';
  $scope.year = '';

  this.date = moment();
	this.day = undefined;
	this.scheduleStart = undefined;
	this.scheduleEnd = undefined;
  this.todayMonth = undefined;
  this.todayWeek = this.date.week();
  this.todayYear = this.date.year();
  this.monthWeeks = [];
  this.currIndexOfWeeksArray = 0;

	this.schedulesLabels = ['0', '0:30', '1', '1:30', '2', '2:30', '3', '3:30', '4','4:30', '5', '5:30',
  	 '6', '6:30', '7', '7:30', '8', '8:30','9', '9:30', '10', '10:30', '11', '11:30', '12', '12:30',
  	 '13', '13:30', '14', '14:30', '15', '15:30', '16', '16:30', '17', '17:30', '18', '18:30',
  	 '19', '19:30', '20', '20:30', '21', '21:30', '22', '22:30', '23', '23:30', '0'];

    this.schedules = [0,0.5,1,1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10,
	   10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 
	   20, 20.5, 21, 21.5, 22, 22.5, 23, 23.5, 24];

	this.initSearch = function() {
		this.initCalendar();
	};

    this.initCalendar = function () {
      $scope.week = this.date.week();
      $scope.year = this.date.year();
      this.initWeek();
    };


    this.initWeek = function() {
      this.todayMonth = this.date.month();
      this.initWeekData(this.todayMonth, this.todayYear);
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
      if($scope.currentRoom !== undefined){
        $scope.initWeekBookings();
      }
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
    		for(var i = 0; i < freeRooms.length; i++){
    			$scope.availableRooms.push(freeRooms[i].freeRoom);
    		}
    		$scope.dataLoading = false;
    	}, function(data) {
    		$scope.error = data.data.error;
    		$scope.dataLoading = false;
    	});
    };

    this.selectDay = function(monthDay){
      this.day = this.date.month(monthDay.month).date(monthDay.day).format('ddd DD-MM-YYYY');
    };


});