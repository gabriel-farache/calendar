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
        controllerAs: 'calendarCtrl',
        resolve: 'calendarCtrl.resolve'
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
