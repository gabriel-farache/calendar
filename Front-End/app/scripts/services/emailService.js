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