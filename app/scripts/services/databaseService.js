'use strict';
function DatabaseService($http) {
  var serverAddr = 'http://localhost/';
	function getBookingDB(index) {
      var URL = serverAddr+'CRUD.php?action=get_booking';
      var params = {
        'id'        : index,
      };
        return ($http.post(URL,params));
    }

    function getAllBookingDB() {
      var URL = serverAddr+'CRUD.php?action=get_all_booking';
      var params = {
      };
      return ($http.get(URL, params));
    }

    function getWeekBookingDB(year, week, currentRoom) {
      var URL = serverAddr+'CRUD.php?action=get_week_booking';
      var params = {
                'year'      : year,
                'week'      : week,
                'room'      : currentRoom
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
 
 
    function deleteBookingDB(index, username, authToken) {  
 		var URL = serverAddr+'CRUD.php?action=delete_booking';
 		var params = {'id' : index, 'authToken' : authToken, 'username' : username};
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

    function deleteBookingsDB(bookingsToRemoveIds, authToken){

      var URL = serverAddr+'CRUD.php?action=delete_bookings';
      var params = {
        'bookingsIds' : bookingsToRemoveIds, 
        'authToken'   : authToken
      };
      return ($http.post(URL, params));
    }

    function getBookersDB() {
      var URL = serverAddr+'CRUD.php?action=get_bookers';
      var params = {
        
      };
      return ($http.get(URL, params));
    }

    function getRoomsDB() {
      var URL = serverAddr+'CRUD.php?action=get_rooms';
      var params = {
        
      };
      return ($http.get(URL, params));
    }

    function updateRoomDB(room, authToken) {
      var URL = serverAddr+'CRUD.php?action=update_room';
      var params = {
        newName: room.name,
        oldName: room.oldName ,
        authToken: authToken       
      };
      return ($http.post(URL, params));
    }

    function deleteRoomDB(room, authToken) {
      var URL = serverAddr+'CRUD.php?action=delete_room';
      var params = {
        roomName: room.name,
        authToken: authToken
      };
      return ($http.post(URL, params));
    }

    function authenticate(username, encodedPassword){
		var URL = serverAddr+'CRUD.php?action=authenticate';
    	var params = {
                      'username'            : username,
                      'encodedPassword'   	: encodedPassword,
                  };
      return ($http.post(URL,params));
    }
    function register(email, username, encodedPassword, generatedAdminToken){
		var URL = serverAddr+'CRUD.php?action=register';
    	var params = {
                      'email'               : email,
                      'username'            : username,
                      'encodedPassword'   	: encodedPassword,
                      'adminToken'          : generatedAdminToken
                  };
      return ($http.post(URL,params));
    }
    function setServerAddress(serverAddress) {
      serverAddr = serverAddress;
    }

    function getServerAddress() {
      return serverAddr;
    }

    function generateAdminToken(adminAuthToken) {
    var URL = serverAddr+'CRUD.php?action=generateAdminToken';
      var params = {'adminAuthToken'   : adminAuthToken};
      return ($http.post(URL,params));
    }

    function getFreeRoomsForSlot(day, scheduleStart, scheduleEnd){
      var URL = serverAddr+'CRUD.php?action=get_free_rooms_for_slot';
      var params = {
        'day'           : day,
        'scheduleStart' : scheduleStart,
        'scheduleEnd'   : scheduleEnd
      };
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
    service.deleteBookingsDB = deleteBookingsDB;
    service.updateRoomDB = updateRoomDB;
    service.deleteRoomDB = deleteRoomDB;
    service.getFreeRoomsForSlot = getFreeRoomsForSlot;

    return service;
 }

angular.module('calendarApp').factory('databaseService', DatabaseService);

DatabaseService.$inject = ['$http'];   