'use strict';
function DatabaseService($http) {
  var serverAddr = 'http://localhost/';
	function getBookingDB(index, authToken) {
      var URL = serverAddr+'CRUD.php?action=get_booking';
      var params = {
        'id'        : index,
        'authToken' : authToken
      };
        return ($http.post(URL,params));
    }

    function getAllBookingDB() {
      var URL = serverAddr+'CRUD.php?action=get_all_booking';
      var params = {
        'authToken' : authToken
      };
      return ($http.get(URL, params));
    }

    function getWeekBookingDB(year, week, currentRoom, authToken) {
      var URL = serverAddr+'CRUD.php?action=get_week_booking';
      var params = {
                'year'      : year,
                'week'      : week,
                'room'      : currentRoom,
                'authToken' : authToken
            };
      return ($http.post(URL,params));
    }
  
    function addBookingDB(booking, authToken) {
      var URL = serverAddr+'CRUD.php?action=add_booking';
      var params = {
                'room'          : booking.room,
                'scheduleStart' : booking.scheduleStart,
                'scheduleEnd'   : booking.scheduleEnd,
                'day'           : booking.day,
                'week'          : booking.week,
                'year'          : booking.year,
                'bookedBy'      : booking.bookedBy,
                'authToken'     : authToken
            };
        return ($http.post(URL,params));
    }
 
 
    function deleteBookingDB(index, authToken) {  
 		var URL = serverAddr+'CRUD.php?action=delete_booking';
 		var params = {'id' : index, 'authToken' : authToken};
      return ($http.post(URL,params));
    }
  
    function updateBookingDB(booking, currentRoom, authToken) {
 		var URL = serverAddr+'CRUD.php?action=update_booking';
 		var params = {
                        'id'            : booking.id,
                        'room'          : currentRoom,
                        'scheduleStart' : booking.scheduleStart,
                        'scheduleEnd'   : booking.scheduleEnd,
                        'day'           : booking.day,
                        'week'          : booking.week,
                        'year'          : booking.year,
                        'bookedBy'      : booking.bookedBy,
                        'isValidated'   : booking.isValidated,
                        'authToken'     : authToken
                    };
        return ($http.post(URL,params));
    }

    function validateBookingDB(bookingId, authToken) {
    	var URL = serverAddr+'CRUD.php?action=validate_booking';
    	var params = {
                      'id'            : bookingId,
                      'isValidated'   : true,
                      'authToken'     : authToken
                  };
      return ($http.post(URL,params));
    }

    function getBookersDB(authToken) {
      var URL = serverAddr+'CRUD.php?action=get_bookers';
      var params = {
        'authToken' : authToken
      };
      return ($http.get(URL, params));
    }

    function getRoomsDB(authToken) {
      var URL = serverAddr+'CRUD.php?action=get_rooms';
      var params = {
        'authToken' : authToken
      };
      return ($http.get(URL, params));
    }

    function authenticate(username, encodedPassword, authToken){
		var URL = serverAddr+'CRUD.php?action=authenticate';
    	var params = {
                      'username'            : username,
                      'encodedPassword'   	: encodedPassword,
                      'authToken'           : authToken
                  };
      return ($http.post(URL,params));
    }
    function register(username, encodedPassword, adminToken){
		var URL = serverAddr+'CRUD.php?action=register';
    	var params = {
                      'username'            : username,
                      'encodedPassword'   	: encodedPassword,
                      'adminToken'          : adminToken
                  };
      return ($http.post(URL,params));
    }
    function setServerAddress(serverAddress) {
      serverAddr = serverAddress;
    }

    function getServerAddress() {
      return serverAddr;
    }

    function generateAdminToken(adminAuthToken, authToken) {
    var URL = serverAddr+'CRUD.php?action=generateAdminToken';
      var params = {'adminAuthToken'   : adminAuthToken};
      return ($http.post(URL,params));
    }

    var service = {};
    service.getBookingDB = getBookingDB;
    service.getAllBookingDB = getAllBookingDB;
    service.getWeekBookingDB = getWeekBookingDB;
    service.addBookingDB = addBookingDB;
    service.deleteBookingDB = deleteBookingDB;
    service.updateBookingDB = updateBookingDB;
    service.getRoomsDB = getRoomsDB;
    service.getBookersDB = getBookersDB;
    service.validateBookingDB = validateBookingDB;
    service.authenticate = authenticate;
    service.register = register;
    service.setServerAddress = setServerAddress;
    service.getServerAddress = getServerAddress;
    service.generateAdminToken = generateAdminToken;

    return service;
 }

angular.module('calendarApp').factory('databaseService', DatabaseService);

DatabaseService.$inject = ['$http'];   