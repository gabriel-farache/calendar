'use strict';

function GlobalizationService($http, $rootScope, $window) {
    var localize = {
        // use the $window service to get the language of the user's browser
        language:$window.navigator.userLanguage || $window.navigator.language,
        // array to hold the localized resource string entries
        dictionary:{},
        // flag to indicate if the service hs loaded the resource file
        resourceFileLoaded:false
    };

    function successCallback(data) {
        // store the returned array in the dictionary
        localize.dictionary = angular.copy(data);
        // set the flag that the resource are loaded
        localize.resourceFileLoaded = true;
        // broadcast that the file has been loaded
        $rootScope.$broadcast('localizeResourcesUpdates');
    }

    function initLocalizedResources() {
        // build the url to retrieve the localized resource file
        var url = '/i18n/resources-locale_' + localize.language + '.js';
        // request the resource file
        $http({ method:"GET", url:url, cache:false }).success(successCallback).error(function () {
            // the request failed set the url to the default resource file
            var url = '/i18n/resources-locale_default.js';
            // request the default resource file
            $http({ method:"GET", url:url, cache:false }).success(successCallback);
        });
    }

    function getLocalizedString(key) {
        // default the result to an empty string
        var result = '';
        // check to see if the resource file has been loaded
        if (!localize.resourceFileLoaded) {
            // call the init method
            initLocalizedResources();
            // set the flag to keep from looping in init
            localize.resourceFileLoaded = true;
            // return the empty string
            return result;
        }
        // make sure the dictionary has valid data
        if (localize.dictionary !== {}){
            // use the filter service to only return those entries which match the value
            // and only take the first result
            var entry = localize.dictionary[key];
            // check to make sure we have a valid entry
            if ((entry !== null) && (entry !== undefined)) {
                // set the result
                result = entry;
            }
        }
        // return the value to the call
        return result;
    }
    var service = {};
    service.localize = localize;
    service.getLocalizedString = getLocalizedString;
    service.initLocalizedResources = initLocalizedResources;
    service.successCallback = successCallback;

    return service;
}

angular.module('calendarApp').factory('globalizationService', GlobalizationService);

GlobalizationService.$inject = ['$http', '$rootScope', '$window'];   

angular.module('calendarApp').filter('i18n', ['globalizationService', function (globalizationService) {
    return function (input) {
        return globalizationService.getLocalizedString(input);
    };
}]);