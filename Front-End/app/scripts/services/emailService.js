'use strict';

function EmailService($http, WS_CONF) {
    var serverAddr = WS_CONF.url;
    var rootFolder = WS_CONF.rootFolder;
    var emailFile = 'emailSending.php';

    if (serverAddr.indexOf('http://') !== 0 && serverAddr.indexOf('https://') !== 0) {
        serverAddr = 'http://' + serverAddr;
    }

    if (serverAddr.indexOf('/', serverAddr.length - 1) !== 0) {
        serverAddr = serverAddr + '/';
    }

    function sendEmail(from, to, cc, subject, message, adminAuthToken) {
        var URL = serverAddr + rootFolder + emailFile;
        var params = {
            'from': from,
            'to': to,
            'cc': cc,
            'subject': subject,
            'message': message,
            'adminAuthToken': adminAuthToken
        };
        return ($http.post(URL, params));
    }
    var service = {};
    service.sendEmail = sendEmail;

    return service;
}

angular.module('calendarApp').factory('emailService', EmailService);

EmailService.$inject = ['$http', 'WS_CONF'];