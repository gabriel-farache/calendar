/*jslint bitwise: true */
'use strict';


function AuthenticationService($http, $cookies, $rootScope, $timeout, databaseService, sharedService) {

    function Login(username, password) {

        return databaseService.authenticate(username, password);

    }

    function SetCredentials(username, token, isAdmin, userEmail, endAvailability) {
        var credentials = {
            'token': token,
            'username': username,
            'isAdmin': isAdmin,
            'userEmail': userEmail,
            'endAvailability': new Date(endAvailability)
        };
        /*var config = {
            secure: false
         };*/
        $rootScope.globals = credentials;
        sharedService.prepForBroadcast(credentials);
        $http.defaults.headers.common['Authorization'] = 'Basic ' + token; // jshint ignore:line
        $cookies.putObject('globals', $rootScope.globals);
    }

    function CheckCookiesValidity() {
        var globalsCookies = $cookies.getObject('globals');
        if (globalsCookies !== undefined &&
            globalsCookies.endAvailability >= new Date()) {
            service.ClearCredentials();
        }
    }

    function ClearCredentials() {
        var credentials = {
            'token': undefined,
            'username': undefined,
            'isAdmin': false,
            'userEmail': undefined,
            'endAvailability': undefined
        };
        $rootScope.globals = credentials;
        sharedService.prepForBroadcast(credentials);
        $cookies.remove('globals');
        $http.defaults.headers.common.Authorization = 'Basic';
    }
    // Base64 encoding service used by AuthenticationService
    var Base64 = {

        keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

        encode: function(input) {
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

        decode: function(input) {
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
    service.CheckCookiesValidity = CheckCookiesValidity;

    return service;

}

angular
    .module('calendarApp')
    .factory('authenticationService', AuthenticationService);

AuthenticationService.$inject = ['$http', '$cookies', '$rootScope', '$timeout', 'databaseService', 'sharedService'];
/*jslint bitwise: false */