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
        var url = '/i18n/resources-locale_' + localize.language + '.json';
        // request the resource file
        $http({ method:'GET', url:url, cache:false }).success(successCallback).error(function () {
            // the request failed set the url to the default resource file
            var url = '/i18n/resources-locale_default.json';
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