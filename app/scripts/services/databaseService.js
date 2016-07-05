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

  function getDayBookingsDB(day, room) {
      var URL = serverAddr+'CRUD.php?action=get_day_bookings';
      var params = {
        'day'        : day,
        'room'       : room
      };
        return ($http.post(URL,params));
  }

  function getConflictedBookingsDB(booking) {
    var URL = serverAddr+'CRUD.php?action=get_conflicted_bookings';
      var params = {
        'day'           : booking.day,
        'room'          : booking.room,
        'year'          : booking.year,
        'scheduleStart' : booking.scheduleStart,
        'scheduleEnd'   : booking.scheduleEnd,
        'id'            : booking.id === undefined ? null : booking.id
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
                'authToken'     : authToken,
                'isValidated'   : booking.isValidated === undefined ? false : booking.isValidated,
                'isPeriodic'    : booking.isPeriodic === undefined ? false : booking.isPeriodic
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

    function getBookerEmailDB(booker, authToken) {
      var URL = serverAddr+'CRUD.php?action=get_booker_email';
      var params = {
        'booker' : booker,
        'authToken':authToken
      };
      return ($http.post(URL, params));
    }

    function updateBookerDB(booker, authToken) {
      var URL = serverAddr+'CRUD.php?action=update_booker';
      var params = {
        newName: booker.booker,
        oldName: booker.oldName,
        newColor: booker.color,
        authToken: authToken       
      };
      return ($http.post(URL, params));
    }

    function updateBookerSettingsDB(booker, authToken) {
      var URL = serverAddr+'CRUD.php?action=update_booker_settings';
      var params = {
        booker: booker.oldBooker,
        newBooker : booker.booker,
        email: booker.email,
        password: booker.password,
        newPassword: booker.newPassword === undefined ? -1 : booker.newPassword,
        authToken: authToken       
      };
      return ($http.post(URL, params));
    }

    function deleteBookerDB(booker, authToken) {
      var URL = serverAddr+'CRUD.php?action=delete_booker';
      var params = {
        booker: booker.booker,
        authToken: authToken
      };
      return ($http.post(URL, params));
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
        oldName: room.oldName,
        authToken: authToken       
      };
      return ($http.post(URL, params));
    }

    function addRoomDB(room, authToken) {
      var URL = serverAddr+'CRUD.php?action=add_room';
      var params = {
        newName: room.name,
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

    function getPeriodicBookingsDB(bookerName, authToken) {
      var URL = serverAddr+'CRUD.php?action=get_periodic_bookings';
      var params = {
        'booker'  : bookerName,
        authToken: authToken 
      };
      return ($http.post(URL,params));
    }

    function getPeriodicBookingDB(periodicBookingID, authToken) {
      var URL = serverAddr+'CRUD.php?action=get_periodic_booking';
      var params = {
        'periodicBookingID'  : periodicBookingID,
        authToken: authToken 
      };
      return ($http.post(URL,params));
    }

    function addPeriodicBookingDB(newPeriodicBooking, bookerName, authToken) {
      var URL = serverAddr+'CRUD.php?action=add_periodic_booking';
      var params = {
        'periodicBookingStartingDay' : newPeriodicBooking.periodicBookingStartingDay,
        'periodicBookingStartingMonth' : newPeriodicBooking.periodicBookingStartingMonth,
        'periodicBookingStartingYear' : newPeriodicBooking.periodicBookingStartingYear,
        'periodicBookingScheduleStart' : newPeriodicBooking.periodicBookingScheduleStart,
        'periodicBookingScheduleEnd' : newPeriodicBooking.periodicBookingScheduleEnd,
        'periodicBookingWeeksDuration' : newPeriodicBooking.periodicBookingWeeksDuration,
        'room' : newPeriodicBooking.room,
        'booker'  : bookerName,
        authToken: authToken 
      };
      return ($http.post(URL,params));
    }

    function deletePeriodicBookingDB(periodicBookingID, bookerName, currentWeek, dayStr, leftWeekDuration, authToken) {
      var URL = serverAddr+'CRUD.php?action=delete_periodic_booking';
      var params = {
        'periodicBookingID' : periodicBookingID,
        'username' : bookerName,
        'currentWeek' : currentWeek,
        'dayStr' : dayStr,
        'leftWeekDuration' : leftWeekDuration,
        'authToken': authToken 
      };
      return ($http.post(URL,params));
    }

    function validatePeriodicBookingDB(periodicBookingID, bookerName, authToken) {
      var URL = serverAddr+'CRUD.php?action=validate_periodic_booking';
      var params = {
        'periodicBookingID' : periodicBookingID,
        'isValidated' : true,
        authToken: authToken 
      };
      return ($http.post(URL,params));
    }

    var service = {};
    service.getBookingDB              = getBookingDB;
    service.getAllBookingDB           = getAllBookingDB;
    service.getWeekBookingDB          = getWeekBookingDB;
    service.addBookingDB              = addBookingDB;
    service.deleteBookingDB           = deleteBookingDB;
    service.updateBookingDB           = updateBookingDB;
    service.getRoomsDB                = getRoomsDB;
    service.getBookersDB              = getBookersDB;
    service.updateBookerDB            = updateBookerDB;
    service.deleteBookerDB            = deleteBookerDB;
    service.validateBookingDB         = validateBookingDB;
    service.authenticate              = authenticate;
    service.register                  = register;
    service.setServerAddress          = setServerAddress;
    service.getServerAddress          = getServerAddress;
    service.generateAdminToken        = generateAdminToken;
    service.deleteBookingsDB          = deleteBookingsDB;
    service.updateRoomDB              = updateRoomDB;
    service.deleteRoomDB              = deleteRoomDB;
    service.getFreeRoomsForSlot       = getFreeRoomsForSlot;
    service.getBookerEmailDB          = getBookerEmailDB;
    service.updateBookerSettingsDB    = updateBookerSettingsDB;
    service.addRoomDB                 = addRoomDB;
    service.getPeriodicBookingsDB     = getPeriodicBookingsDB;
    service.addPeriodicBookingDB      = addPeriodicBookingDB;
    service.deletePeriodicBookingDB   = deletePeriodicBookingDB;
    service.validatePeriodicBookingDB = validatePeriodicBookingDB;
    service.getPeriodicBookingDB      = getPeriodicBookingDB;
    service.getConflictedBookingsDB   = getConflictedBookingsDB;
    service.getDayBookingsDB          = getDayBookingsDB;

    return service;
 }

angular.module('calendarApp').factory('databaseService', DatabaseService);

DatabaseService.$inject = ['$http'];   