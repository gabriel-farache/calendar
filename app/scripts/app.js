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
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'angularMoment'
  ])
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
