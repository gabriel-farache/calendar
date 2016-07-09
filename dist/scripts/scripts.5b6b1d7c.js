'use strict';

function GlobalizationService($http, $rootScope, $window) {
    var DEFAULT_INIT = {'fr' : {'INDEX_WELCOME_LABEL' : 'Bienvenue',
                           'INDEX_SEARCH_FREE_SLOT_BUTTON' : 'Chercher salles libres',
                           'INDEX_PERIODIC_BOOKING_BUTTON' : 'Réservations périodiques',
                           'INDEX_ADMIN_CONSOLE_BUTTON' : 'Administration',
                           'INDEX_ACCOUNT_BUTTON' : 'Mon compte',
                           'INDEX_LOGIN_BUTTON' : 'S\'authentifier',
                           'INDEX_LOGOFF_BUTTON' : 'Se déconnecter'},
                        'fr-FR' : {'INDEX_WELCOME_LABEL' : 'Bienvenue',
                           'INDEX_SEARCH_FREE_SLOT_BUTTON' : 'Chercher salles libres',
                           'INDEX_PERIODIC_BOOKING_BUTTON' : 'Réservations périodiques',
                           'INDEX_ADMIN_CONSOLE_BUTTON' : 'Administration',
                           'INDEX_ACCOUNT_BUTTON' : 'Mon compte',
                           'INDEX_LOGIN_BUTTON' : 'S\'authentifier',
                           'INDEX_LOGOFF_BUTTON' : 'Se déconnecter'},
                        'en' : {'INDEX_WELCOME_LABEL' : 'Welcome',
                           'INDEX_SEARCH_FREE_SLOT_BUTTON' : 'Search free slot',
                           'INDEX_PERIODIC_BOOKING_BUTTON' : 'Periodic bookings',
                           'INDEX_ADMIN_CONSOLE_BUTTON' : 'Administration',
                           'INDEX_ACCOUNT_BUTTON' : 'My account',
                           'INDEX_LOGIN_BUTTON' : 'Login',
                           'INDEX_LOGOFF_BUTTON' : 'Logoff'},
                        'en-US' : {'INDEX_WELCOME_LABEL' : 'Welcome',
                           'INDEX_SEARCH_FREE_SLOT_BUTTON' : 'Search free slot',
                           'INDEX_PERIODIC_BOOKING_BUTTON' : 'Periodic bookings',
                           'INDEX_ADMIN_CONSOLE_BUTTON' : 'Administration',
                           'INDEX_ACCOUNT_BUTTON' : 'My account',
                           'INDEX_LOGIN_BUTTON' : 'Login',
                           'INDEX_LOGOFF_BUTTON' : 'Logoff'}
                       };
    var localize = {
        // use the $window service to get the language of the user's browser
        language:$window.navigator.userLanguage || $window.navigator.language,
        // array to hold the localized resource string entries
        dictionary:[],
        // flag to indicate if the service hs loaded the resource file
        resourceFileLoaded:false
    };

    function successCallback(data) {
        // store the returned array in the dictionary
        localize.dictionary = data;
        // set the flag that the resource are loaded
        localize.resourceFileLoaded = true;
        // broadcast that the file has been loaded
        $rootScope.$broadcast('localizeResourcesUpdates');
    }

    function initLocalizedResources() {
        // build the url to retrieve the localized resource file
        var url = '/i18n/resources-locale_' + localize.language + '.js';
        // request the resource file
        $http({ method:'GET', url:url, cache:false }).success(successCallback).error(function () {
            // the request failed set the url to the default resource file
            var url = '/i18n/resources-locale_default.js';
            // request the default resource file
            $http({ method:'GET', url:url, cache:false }).success(successCallback);
        });
    }

    function getLocalizedString(key) {
        // default the result to an empty string
        var result = '';
        //console.log(key);
        //console.log(localize.dictionary.length);
        // make sure the dictionary has valid data
        if (localize.dictionary !== [] && localize.dictionary.length > 0){
            // use the filter service to only return those entries which match the value
            // and only take the first result
            var entry = localize.dictionary[0][key];
            // check to make sure we have a valid entry
            if ((entry !== null) && (entry !== undefined)) {
                // set the result
                result = entry;
            }
        }else {

        }
        // return the value to the call
        return result;
    }
    localize.dictionary.push(DEFAULT_INIT[localize.language]);
    initLocalizedResources();

    var service = {};
    service.localize = localize;
    service.getLocalizedString = getLocalizedString;
    service.initLocalizedResources = initLocalizedResources;
    service.successCallback = successCallback;

    return service;
}

angular.module('localization', []).factory('globalizationService', GlobalizationService);

GlobalizationService.$inject = ['$http', '$rootScope', '$window'];   

angular.module('localization').filter('i18n', ['globalizationService', function (globalizationService) {
    return function (input) {
        return globalizationService.getLocalizedString(input);
    };
}]);
'use strict';

/**
 * @ngdoc overview
 * @name calendarApp
 * @description
 * # calendarApp
 *
 * Main module of the application.
 */
angular
  .module('calendarApp', [
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngRoute',
    'angularMoment',
    'ngSanitize',
    'ui.bootstrap.materialPicker',
    'localization'
  ])
  .directive('trustedHTML', ['$sce', function($sce) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function(value) {
          return $sce.trustAsHTML(value);
        });
      }
    };
  }])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider      
      .when('/loginout/:param', {
        templateUrl: 'views/login.html',
        controller: 'loginController',
        controllerAs: 'loginCtrl'
      }).when('/register', {
        templateUrl: 'views/register.html',
        controller: 'registerController',
        controllerAs: 'registerCtrl'
      }).when('/adminConsole', {
        templateUrl: 'views/adminConsole.html',
        controller: 'adminConsoleController',
        controllerAs: 'adminConsoleCtrl'
      }).when('/userConsole', {
        templateUrl: 'views/userConsole.html',
        controller: 'userConsoleController',
        controllerAs: 'userConsoleCtrl'
      }).when('/searchFreeSlot', {
        templateUrl: 'views/freeSlot.html',
        controller: 'freeSlotController',
        controllerAs: 'freeSlotCtrl'
      }).when('/periodicBooking', {
        templateUrl: 'views/periodicBooking.html',
        controller: 'periodicBookingController',
        controllerAs: 'periodicBookingCtrl'
      }).when('/', {
        templateUrl: 'views/calendar.html',
        controller: 'calendarController',
        controllerAs: 'calendarCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });
      $locationProvider.html5Mode(true);
  });
'use strict';

function SharedService($rootScope) {
    var sharedService = {};
    
    sharedService.message = '';
    sharedService.calendar = [];
    sharedService.booking = {};
    sharedService.callerName = '';

    sharedService.prepForBroadcast = function(msg) {
        this.message = msg;
        this.broadcastItem();
    };

    sharedService.broadcastItem = function() {
        $rootScope.$broadcast('handleBroadcast');
    };

    sharedService.prepForNewBookingAddedBroadcast = function() {
        this.broadcastNewBookingAdded();
    };

    sharedService.broadcastNewBookingAdded = function() {
        $rootScope.$broadcast('newBookingsAddedBroadcast');
    };

    sharedService.prepForBookingValidatedBroadcast = function(calendar, booking, caller) {
        this.calendar = calendar;
        this.booking = booking;
        this.callerName = caller;
        this.broadcastBookingValidated();
    };

    sharedService.broadcastBookingValidated = function() {
        $rootScope.$broadcast('BookingValidated');
    };
    

    return sharedService;
}

angular
    .module('calendarApp')
    .factory('sharedService', SharedService);

SharedService.$inject = ['$rootScope'];
'use strict';
function DatabaseService($http) {
  var serverAddr = 'http://gabiraspi.ddns.net/';
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
'use strict';
function CommonService(databaseService, emailService, globalizationService, sharedService) {
    function validateBooking(booking, authToken, calendar, caller, handleErrorDBCallback) {
      var bookingToValidate = booking;
          databaseService.validateBookingDB(bookingToValidate.id, authToken).then(function () {
            bookingToValidate.isValidated = true;
            sharedService.prepForBookingValidatedBroadcast(calendar, bookingToValidate, caller);       
        },handleErrorDBCallback);
    }

    function cancelConflictedBookings(authToken, bookingToValidateID, bookingsSharingSlotToBeCancelled, refreshCalendarAfterDeletionFunction, handleErrorDBCallback){
      if(bookingsSharingSlotToBeCancelled !== []) {
        var bookingToRemoveIds= [];
        for (var i = 0; i < bookingsSharingSlotToBeCancelled.length; i++){
          var bookingsSharingSlotID = bookingsSharingSlotToBeCancelled[i].id;
          if(bookingToValidateID !== bookingsSharingSlotID){
            bookingToRemoveIds.push(bookingsSharingSlotToBeCancelled[i].id);
          }
        }
        databaseService.deleteBookingsDB(bookingToRemoveIds, authToken)
          .then(refreshCalendarAfterDeletionFunction, handleErrorDBCallback);
      }
    }

    function getBookingsSharingSlot(booking, calendar, bookingsSharingSlot) {
      if(calendar !== undefined && booking !== undefined) {
        var start = parseFloat(booking.scheduleStart);
        var bookingID = booking.id;
        var end = parseFloat(booking.scheduleEnd);
        for (var i = 0; i < calendar.length; i++) {
          var detail = calendar[i];
          var dStart = detail.scheduleStart;
          var dEnd = parseFloat(detail.scheduleEnd);
          if(bookingID !== detail.id &&
            booking.day === detail.day &&
            parseInt(booking.year) === parseInt(detail.year) &&
            dStart < end && start < dEnd) {
            bookingsSharingSlot.push(angular.copy(detail));
          }
        }
      }
    }


    function sendEmails(bookingValidated, bookingsCancelled, authToken, I18N_VALIDATION_EMAIL_SUBJECT, I18N_VALIDATION_EMAIL_BODY, I18N_CANCEL_EMAIL_SUBJECT, I18N_CANCEL_EMAIL_BODY, handleErrorDBCallback){
      sendConfirmationEmail(bookingValidated, authToken, I18N_VALIDATION_EMAIL_SUBJECT, I18N_VALIDATION_EMAIL_BODY, handleErrorDBCallback);
      sendCancelationEmails(bookingValidated.id, authToken, bookingsCancelled, I18N_CANCEL_EMAIL_SUBJECT, I18N_CANCEL_EMAIL_BODY, handleErrorDBCallback);  
    }

    function sendConfirmationEmail(booking, authToken, I18N_VALIDATION_EMAIL_SUBJECT, I18N_VALIDATION_EMAIL_BODY, handleErrorDBCallback){
      databaseService.getBookerEmailDB(booking.bookedBy, authToken).
      then(function(response) {
        var to = response.data.email;
        var from = 'admin@admin.fr';
        var cc = '';
        var scheduleStart = (booking.scheduleStart+'h').replace('.5h', 'h30');
        var scheduleEnd = (booking.scheduleEnd+'h').replace('.5h', 'h30');
        var subject = globalizationService.getLocalizedString(I18N_VALIDATION_EMAIL_SUBJECT);
        var body = globalizationService.getLocalizedString(I18N_VALIDATION_EMAIL_BODY);
        subject = subject.replace('<BOOKING_DAY>', booking.day)
                .replace('<BOOKING_SCHEDULE_START>', scheduleStart)
                .replace('<BOOKING_SCHEDULE_END>', scheduleEnd);

         body = body.replace('<BOOKING_DAY>', booking.day)
                .replace('<BOOKING_SCHEDULE_START>', scheduleStart)
                .replace('<BOOKING_SCHEDULE_END>', scheduleEnd);

        emailService.sendEmail(from, to, cc, subject, body, authToken);

      }, handleErrorDBCallback);
    }

    function sendCancelationEmails(bookingValidatedID, authToken, bookingsCancelled, I18N_CANCEL_EMAIL_SUBJECT, I18N_CANCEL_EMAIL_BODY, handleErrorDBCallback) {
      if(bookingsCancelled !== undefined){
        for(var i = 0; i < bookingsCancelled.length; i++) {
          var bookingCancelled = bookingsCancelled[i];
          if(bookingCancelled.id !== bookingValidatedID) {
            databaseService.getBookerEmailDB(bookingCancelled.bookedBy, authToken).
            then(cancellationEmailsCallback(bookingCancelled, authToken, I18N_CANCEL_EMAIL_SUBJECT, I18N_CANCEL_EMAIL_BODY),
            handleErrorDBCallback);
          }
        }
      }
          
      }

      function cancellationEmailsCallback(bookingCancelled, authToken, I18N_CANCEL_EMAIL_SUBJECT, I18N_CANCEL_EMAIL_BODY){
        return (function(response) {
                  sendCancelationEmail(response, bookingCancelled, authToken,
                      I18N_CANCEL_EMAIL_SUBJECT, I18N_CANCEL_EMAIL_BODY);
                });
      }

    function sendCancelationEmail (response, bookingCancelled, authToken, I18N_CANCEL_EMAIL_SUBJECT, I18N_CANCEL_EMAIL_BODY) {
        var to = response.data.email;
        var from = 'admin@admin.fr';
        var cc = '';
        var scheduleStart = (bookingCancelled.scheduleStart+'h').replace('.5h', 'h30');
        var scheduleEnd = (bookingCancelled.scheduleEnd+'h').replace('.5h', 'h30');
        var subject = globalizationService.getLocalizedString(I18N_CANCEL_EMAIL_SUBJECT);
        var body = globalizationService.getLocalizedString(I18N_CANCEL_EMAIL_BODY);
        subject = subject.replace('<BOOKING_DAY>', bookingCancelled.day)
            .replace('<BOOKING_SCHEDULE_START>', scheduleStart)
            .replace('<BOOKING_SCHEDULE_END>', scheduleEnd);

        body = body.replace('<BOOKING_DAY>', bookingCancelled.day)
            .replace('<BOOKING_SCHEDULE_START>', scheduleStart)
            .replace('<BOOKING_SCHEDULE_END>', scheduleEnd);

        emailService.sendEmail(from, to, cc, subject, body, authToken);
    }

    var service = {};
    service.validateBooking = validateBooking;
    service.getBookingsSharingSlot = getBookingsSharingSlot;
    service.sendEmails = sendEmails;
    service.sendConfirmationEmail = sendConfirmationEmail;
    service.sendCancelationEmails = sendCancelationEmails;
    service.sendCancelationEmail = sendCancelationEmail;
    service.cancelConflictedBookings = cancelConflictedBookings;

    return service;
}


angular.module('calendarApp').factory('commonService', CommonService);

CommonService.$inject = ['databaseService', 'emailService', 'globalizationService', 'sharedService'];  
'use strict';

function EmailService($http) {
  var serverAddr = 'http://localhost/';

  function sendEmail(from, to, cc, subject, message, adminAuthToken){
    var URL = serverAddr+'emailSending.php';
      var params = {
        'from'              : from,
        'to'                : to,
        'cc'                : cc,
        'subject'           : subject,
        'message'           : message,
        'adminAuthToken'    : adminAuthToken
      };
    return ($http.post(URL,params));
  }
var service = {};
    service.sendEmail = sendEmail;

    return service;
 }

angular.module('calendarApp').factory('emailService', EmailService);

EmailService.$inject = ['$http'];   
/*jslint bitwise: true */
'use strict';


function AuthenticationService($http, $cookieStore, $rootScope, $timeout, databaseService, sharedService) {
    
    function Login(username, password) {

        return databaseService.authenticate(username, password);

    }

    function SetCredentials(username, token, isAdmin) {
        var credentials = {
            'token': token,
            'username': username,
            'isAdmin' : isAdmin
        };
        $rootScope.globals = credentials;
        sharedService.prepForBroadcast(credentials);
        $http.defaults.headers.common['Authorization'] = 'Basic ' + token; // jshint ignore:line
        $cookieStore.put('globals', $rootScope.globals);
    }

    function ClearCredentials() {
        var credentials = {
            'token': undefined,
            'username': undefined,
            'isAdmin' : false
        };
        $rootScope.globals = credentials;
        sharedService.prepForBroadcast(credentials);
        $cookieStore.remove('globals');
        $http.defaults.headers.common.Authorization = 'Basic';
    }
    // Base64 encoding service used by AuthenticationService
    var Base64 = {

        keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

        encode: function (input) {
            var output = '';
            var chr1, chr2, chr3 = '';
            var enc1, enc2, enc3, enc4 = '';
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    this.keyStr.charAt(enc1) +
                    this.keyStr.charAt(enc2) +
                    this.keyStr.charAt(enc3) +
                    this.keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = '';
                enc1 = enc2 = enc3 = enc4 = '';
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = '';
            var chr1, chr2, chr3 = '';
            var enc1, enc2, enc3, enc4 = '';
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                return undefined;
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

            do {
                enc1 = this.keyStr.indexOf(input.charAt(i++));
                enc2 = this.keyStr.indexOf(input.charAt(i++));
                enc3 = this.keyStr.indexOf(input.charAt(i++));
                enc4 = this.keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 !== 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 !== 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = '';
                enc1 = enc2 = enc3 = enc4 = '';

            } while (i < input.length);

            return output;
        }
    };

    var service = {};
    service.SetCredentials = SetCredentials;
    service.ClearCredentials = ClearCredentials;
    service.Login = Login;
    service.encodeDecode = Base64;

    return service;

}

angular
    .module('calendarApp')
    .factory('authenticationService', AuthenticationService);

AuthenticationService.$inject = ['$http', '$cookieStore', '$rootScope', '$timeout', 'databaseService', 'sharedService'];
/*jslint bitwise: false */

'use strict';

angular
    .module('calendarApp')
    .controller('headerController', ['$scope', '$cookieStore', '$location', 'sharedService', 'authenticationService', 
    function HeaderController($scope, $cookieStore, $location, sharedService, authenticationService) {
        $scope.guestName = 'Visiteur';
        $scope.username = $scope.guestName;
        $scope.isAdmin = false;


    	var globalsCookies = $cookieStore.get('globals');
      	if(globalsCookies !== undefined) {
        	$scope.isAdmin = globalsCookies.isAdmin;
        	$scope.username = globalsCookies.username;
        }

        this.logout = function() {
			authenticationService.ClearCredentials();
			$scope.username = undefined;
	        $scope.isAdmin = false;
            $location.path('/');
        };

        function handleBroadcastCallbackFunction() {
            var message = sharedService.message;
            $scope.username = message.username;
            $scope.username = $scope.username === undefined ? $scope.guestName : $scope.username;
            $scope.isAdmin = message.isAdmin;
        }

        $scope.$on('handleBroadcast', handleBroadcastCallbackFunction);


    }]);

'use strict';

angular
    .module('calendarApp')
    .controller('loginController', ['$scope', '$location', '$routeParams', '$timeout', 'authenticationService', 'globalizationService',
      function LoginController($scope, $location, $routeParams, $timeout, authenticationService, globalizationService) {
        $scope.username = '';
        this.password = '';
        $scope.dataLoading = false;
        $scope.timeoutTime = 5000;
        var action = $routeParams.param;
    this.initLoginController = function initController() {
        // reset login status
        if(action === 'logout'){
            authenticationService.ClearCredentials();
            $scope.error = undefined;
            $location.path('/');
        }
    };

    this.login = function() {
        $scope.error = undefined;
        $scope.dataLoading = true;
        var encodedPassword = authenticationService.encodeDecode.encode(this.password);
        if(encodedPassword !== undefined){
          authenticationService.Login($scope.username,encodedPassword).
              then(function (response) {
                      var data = response.data;
                      authenticationService.SetCredentials($scope.username, data.token, data.isAdmin);
                      $location.path('/');
                  },$scope.handleErrorDBCallback);
        } else {
          $scope.error = globalizationService.getLocalizedString('LOGIN_ENCODE_PASSWORD_ERROR_MSG');
          $timeout($scope.removeErrorMessage, $scope.timeoutTime); 
        }
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

}]);


'use strict';
 
 angular
    .module('calendarApp')
    .controller('registerController',  ['$scope', '$timeout', 'databaseService', 'authenticationService', '$location', 'globalizationService', 
function RegisterController($scope, $timeout, databaseService, authenticationService, $location, globalizationService) {
    this.username = '';
    this.password = '';
    this.email = '';
    this.adminToken = '';
    $scope.dataLoading = false;
    $scope.error = undefined;
    $scope.timeoutTime = 5000;
    this.initRegisterCtrl = function() {

    };
    this.register = function() {
        $scope.dataLoading = true;
        var encodedPassword = authenticationService.encodeDecode.encode(this.password);
        if(encodedPassword !== undefined){
          databaseService.register(this.email, this.username, encodedPassword, this.adminToken)
              .then(function () {
                      $location.path('/loginout/login');
          },$scope.handleErrorDBCallback);
        } else {
          $scope.error = globalizationService.getLocalizedString('LOGIN_ENCODE_PASSWORD_ERROR_MSG');
          $timeout($scope.removeErrorMessage, $scope.timeoutTime); 
        }
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
}]);



'use strict';

/**
 * @ngdoc function
 * @name calendarApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the calendarApp
 */
angular.module('calendarApp')
  .controller('calendarController', ['$scope', '$http', '$window', '$cookieStore', '$timeout', '$interval', 'moment', 'databaseService', 'sharedService', 'authenticationService', 'emailService', 'globalizationService', 'commonService',
  function ($scope, $http, $window, $cookieStore, $timeout, $interval, moment, databaseService, sharedService, authenticationService, emailService, globalizationService, commonService) {
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
      var globalsCookies = $cookieStore.get('globals');
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
      this.initWeek();
    };

    this.initRooms = function() {
      databaseService.getRoomsDB().then(function(data)
      {
        var rooms = data.data;
        $scope.rooms = rooms;
        $scope.currentRoom = rooms[0].room;
        $scope.currentBuilding = $scope.rooms[0].building;
        $scope.initWeekBookings();
        $scope.initBuildingsRooms();
        $scope.error = undefined;
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

    this.initWeek = function() {
      this.initWeekData(this.todayMonth, this.todayYear);
      this.setWeek(this.currIndexOfWeeksArray);
    };

    this.initWeekData = function (newMonth, newYear) {
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
        if(this.todayWeek === weekNumber){
          this.currIndexOfWeeksArray = i;
        }
      }
    };

    this.setWeek = function(indexOfWeeksArray) {
      var weekData = this.monthWeeks[indexOfWeeksArray];
      var newWeekDate = moment().isoWeek(weekData.week).year(weekData.year);
      var currentWeekDate = moment().isoWeek($scope.week).year($scope.year);

      if(newWeekDate.month() !== currentWeekDate.month()){
        this.initWeekData(newWeekDate.month());
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
        },$scope.handleErrorDBCallback);
              
      $scope.booking = {};
      $scope.booking.bookedBy = $scope.username === $scope.guestName ? undefined : $scope.username;
    };

    this.validateBooking = function () {
      commonService.validateBooking($scope.booking, $scope.authToken,
        $scope.calendar, $scope.callerName, $scope.handleErrorDBCallback);
    };

    $scope.$on('BookingValidated', function() {
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
    });


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
        $scope.message = globalizationService.getLocalizedString('CALENDAR_BOOKING_DELETED_MSG');
        $timeout($scope.removeMessage, $scope.timeoutTime);
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

  }]);

'use strict';
angular.module('calendarApp')
  .controller('adminConsoleController', ['$scope', '$cookieStore', '$timeout', '$sce', 'databaseService', 'sharedService', 'authenticationService', 'globalizationService', 
    function ($scope, $cookieStore, $timeout, $sce, databaseService, sharedService, authenticationService, globalizationService) {
        $scope.adminToken = '';
        $scope.adminTokenEndTime = '';
        $scope.error = undefined;
        $scope.dataLoading = false;
        $scope.rooms=[];
        $scope.bookers=[];
        $scope.timeoutTime = 5000;
        $scope.size=10;
        $scope.$on('handleBroadcast', function() {
            var message = sharedService.message;
            $scope.authToken = message.token;
        });

        var globalsCookies = $cookieStore.get('globals');
        if(globalsCookies !== undefined) {
            $scope.authToken = globalsCookies.token;
        }

        this.generateAdminToken = function() {
            $scope.error = undefined;
            $scope.dataLoading = true;
            var globalsCookies = $cookieStore.get('globals');
            if(globalsCookies !== undefined) {
                databaseService.generateAdminToken(globalsCookies.token).
                then(function (response) {
                        var data = response.data;
                        $scope.dataLoading = false;
                        $scope.adminToken = data.adminToken;
                        $scope.adminTokenEndTime = data.adminTokenEndTime;
                    },$scope.handleErrorDBCallback);
            } else {
                $scope.dataLoading = false;
                $scope.error = globalizationService.getLocalizedString('ADMIN_UNKNOWN_AUTH_KEY_MSG');
                $timeout($scope.removeErrorMessage, $scope.timeoutTime); 
            }
            
        };

        $scope.initRooms = function() {
            $scope.rooms=[];
            $scope.dataLoading = true;
            databaseService.getRoomsDB().then(function(data)
            {
                $scope.dataLoading = false;
                var rooms = data.data;
                for(var i = 0; i < rooms.length; i++){
                    var newRoom = {
                        name: rooms[i].room,
                        oldName: undefined,
                        isNew: false
                    };
                    $scope.rooms.push(newRoom);
                }
                $scope.error = undefined;
            },$scope.handleErrorDBCallback);
        };


        this.modifyRoom = function(room){
            room.oldName = room.name;
        };

        this.updateRoomInDB = function(room){
            $scope.dataLoading = true;
            databaseService.addRoomDB(room, $scope.authToken).
                then(function() {
                    $scope.dataLoading = false;
                    $scope.initRooms();
                    $scope.messageAdmin = globalizationService.getLocalizedString('ADMIN_ROOM_UPDATED_MSG');
                    $timeout($scope.removeAdminMessage, $scope.timeoutTime); 
                },$scope.handleErrorDBCallback);
        };

        this.deleteRoomDB = function(room) {
            $scope.dataLoading = true;
            databaseService.deleteRoomDB(room, $scope.authToken).
                then(function() {
                    $scope.dataLoading = false;
                    $scope.initRooms();
                    $scope.messageAdmin = globalizationService.getLocalizedString('ADMIN_ROOM_DELETED_MSG');
                    $timeout($scope.removeAdminMessage, $scope.timeoutTime); 
                },$scope.handleErrorDBCallback);
        };

        this.addNewRoom = function() {
            var newRoom = {
                name: globalizationService.getLocalizedString('ADMIN_NEW_ROOM_MSG'),
                oldName: undefined,
                isNew: true
            };

            $scope.rooms.push(newRoom);
        };

        $scope.initBookers = function() {
            $scope.dataLoading = true;
            $scope.bookers=[];
            databaseService.getBookersDB().then(function(data)
            {
                $scope.dataLoading = false;
                var bookers = data.data;
                for(var i = 0; i < bookers.length; i++){
                    var newBooker = {
                        booker: bookers[i].booker,
                        color: bookers[i].color,
                        oldName: undefined,
                        isNew: false
                    };
                    $scope.bookers.push(newBooker);
                }
                $scope.error = undefined;
            },$scope.handleErrorDBCallback);
        };

        this.modifyBooker = function(booker){
            booker.oldName = booker.booker;
        };

        this.updateBookerInDB = function(booker){
            $scope.dataLoading = true;
            databaseService.updateBookerDB(booker, $scope.authToken).
                then(function() {
                    $scope.dataLoading = false;
                    $scope.initBookers();
                    $scope.messageAdmin = globalizationService.getLocalizedString('ADMIN_USER_UPDATED_MSG');
                    $timeout($scope.removeAdminMessage, $scope.timeoutTime); 
                },$scope.handleErrorDBCallback);
        };

        this.deleteBookerDB = function(booker) {
            $scope.dataLoading = true;
            databaseService.deleteBookerDB(booker, $scope.authToken).
                then(function() {
                    $scope.dataLoading = false;
                    $scope.initBookers();
                    $scope.messageAdmin = globalizationService.getLocalizedString('ADMIN_USER_DELETED_MSG');
                    $timeout($scope.removeAdminMessage, $scope.timeoutTime); 
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

}]);


'use strict';
angular.module('calendarApp')
  .controller('userConsoleController', ['$scope', '$cookieStore', '$timeout', 'databaseService', 'sharedService', 'authenticationService', 'globalizationService',
function ($scope, $cookieStore, $timeout, databaseService, sharedService, authenticationService, globalizationService) {
    $scope.timeoutTime = 10000;
    $scope.isUpdating = false;
    $scope.booker = {};
    $scope.message = undefined;
    $scope.dataLoading = false;

    $scope.$on('handleBroadcast', function() {
        var message = sharedService.message;
        $scope.authToken = message.token;
        $scope.booker.booker = message.username;
    });

    var globalsCookies = $cookieStore.get('globals');
    if(globalsCookies !== undefined) {
        $scope.authToken = globalsCookies.token;
        $scope.booker.oldBooker = globalsCookies.username;
        $scope.booker.booker = globalsCookies.username;
        $scope.isAdmin = globalsCookies.isAdmin;
    }

    $scope.initUser = function() {
        databaseService.getBookerEmailDB($scope.booker.booker, $scope.authToken).
            then(function(response){
                $scope.booker.email = response.data.email;
                $scope.booker.newPassword = undefined;
            },$scope.handleErrorDBCallback);
    };

    this.updateBookerSettings = function() {
        $scope.dataLoading = true;
        $scope.booker.password = authenticationService.encodeDecode.encode($scope.booker.password);

        if($scope.booker.password !== undefined){
            if($scope.booker.newPassword !== undefined) {
                $scope.booker.newPassword = authenticationService.encodeDecode.encode($scope.booker.newPassword);
            }
            if($scope.booker.newPassword !== undefined){
                databaseService.updateBookerSettingsDB($scope.booker, $scope.authToken).
                    then(function() {
                        $scope.message = globalizationService.getLocalizedString('USER_UPDATE_SUCCESSFUL_MSG');
                        $scope.isUpdating = false;
                        $scope.dataLoading = false;
                        $scope.booker.newPassword = undefined;
                        $scope.booker.password = undefined;
                        authenticationService.SetCredentials($scope.booker.booker, $scope.authToken, $scope.isAdmin);
                        $timeout($scope.removeMessage, $scope.timeoutTime);
                        $scope.initUser();
                },$scope.handleErrorDBCallback);
            } else {
                $scope.error = globalizationService.getLocalizedString('LOGIN_ENCODE_PASSWORD_ERROR_MSG');
                $timeout($scope.removeErrorMessage, $scope.timeoutTime); 
            }
        } else {
            $scope.error = globalizationService.getLocalizedString('LOGIN_ENCODE_PASSWORD_ERROR_MSG');
            $timeout($scope.removeErrorMessage, $scope.timeoutTime); 
        }
    };

    this.enableUpdateSettings = function() {
        $scope.isUpdating = true;
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


}]);
'use strict';

/**
 * @ngdoc function
 * @name calendarApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the calendarApp
 */
angular.module('calendarApp')
  .controller('freeSlotController', ['$scope', '$http', '$cookieStore', '$timeout', 'moment', 'databaseService', 'sharedService', 'authenticationService',
  function ($scope, $http, $cookieStore, $timeout, moment, databaseService, sharedService, authenticationService) {
	moment.locale('fr');
  $scope.availableRooms = undefined;
	$scope.dataLoading = false;
  $scope.week = '';
  $scope.year = '';
  $scope.slotsStatuses = [];
  $scope.timeoutTime = 5000;

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
      });

	this.initSearch = function() {
    var globalsCookies = $cookieStore.get('globals');
      if(globalsCookies !== undefined) {
        $scope.authToken = globalsCookies.token;
        $scope.username = globalsCookies.username;
        $scope.isAdmin = globalsCookies.isAdmin;
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
'use strict';

angular
    .module('calendarApp')
    .controller('periodicBookingController', ['$scope', '$cookieStore', '$timeout', '$location', 'moment', 'sharedService', 'databaseService', 'globalizationService', 'emailService', 'authenticationService', 'commonService',
    function PeriodicBookingController($scope, $cookieStore, $timeout, $location, moment, sharedService, databaseService, globalizationService, emailService, authenticationService, commonService) {
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
'use strict';

/**
 * @ngdoc function
 * @name calendarApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the calendarApp
 */
angular.module('calendarApp')
  .controller('AboutCtrl', function () {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
