'use strict';

function GlobalizationService($http, $rootScope, $window, $q, sharedService) {
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

    var isLoaded = false;

    function successCallback(data) {
        var deferred = $q.defer();
      
        // store the returned array in the dictionary
        localize.dictionary = data;
        // set the flag that the resource are loaded
        localize.resourceFileLoaded = true;
        // broadcast that the file has been loaded
        sharedService.prepForI18nLoadedBroadcast();
        
        deferred.resolve('i18n files loaded!');
        isLoaded = true;
        // promise is returned
        return deferred.promise;
    }

    function initLocalizedResources() {
        // build the url to retrieve the localized resource file
        var url = '/i18n/resources-locale_' + localize.language + '.json';
        // request the resource file
        $http({ method:'GET', url:url, cache:false }).then(function(response){
            return successCallback(response.data);
          },
          function () {
            // the request failed set the url to the default resource file
            var url = '/i18n/resources-locale_default.json';
            // request the default resource file
            $http({ method:'GET', url:url, cache:false }).then(function(response){
              return successCallback(response.data);
            });
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

    var service = {};
    service.localize = localize;
    service.getLocalizedString = getLocalizedString;
    service.initLocalizedResources = initLocalizedResources;
    service.successCallback = successCallback;
    service.isLoaded = isLoaded;

    return service;
}

angular.module('localization', []).factory('globalizationService', GlobalizationService);

GlobalizationService.$inject = ['$http', '$rootScope', '$window', '$q', 'sharedService'];   

angular.module('localization').filter('i18n', ['globalizationService', function (globalizationService) {
    return function (input) {
        return globalizationService.getLocalizedString(input);
    };
}]);
