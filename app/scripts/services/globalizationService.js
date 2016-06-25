'use strict';

function GlobalizationService($http, $rootScope, $window) {
    var default_init = {'fr' : {"INDEX_WELCOME_LABEL" : "Bienvenue",
                           "INDEX_SEARCH_FREE_SLOT_BUTTON" : "Chercher salles libres",
                           "INDEX_ADMIN_CONSOLE_BUTTON" : "Administration",
                           "INDEX_ACCOUNT_BUTTON" : "Mon compte",
                           "INDEX_LOGIN_BUTTON" : "S'authentifier",
                           "INDEX_LOGOFF_BUTTON" : "Se déconnecter"},
                        'fr-FR' : {"INDEX_WELCOME_LABEL" : "Bienvenue",
                           "INDEX_SEARCH_FREE_SLOT_BUTTON" : "Chercher salles libres",
                           "INDEX_ADMIN_CONSOLE_BUTTON" : "Administration",
                           "INDEX_ACCOUNT_BUTTON" : "Mon compte",
                           "INDEX_LOGIN_BUTTON" : "S'authentifier",
                           "INDEX_LOGOFF_BUTTON" : "Se déconnecter"},
                        'en' : {"INDEX_WELCOME_LABEL" : "Bienvenue",
                           "INDEX_SEARCH_FREE_SLOT_BUTTON" : "Chercher salles libres",
                           "INDEX_ADMIN_CONSOLE_BUTTON" : "Administration",
                           "INDEX_ACCOUNT_BUTTON" : "Mon compte",
                           "INDEX_LOGIN_BUTTON" : "S'authentifier",
                           "INDEX_LOGOFF_BUTTON" : "Se déconnecter"},
                        'en-US' : {"INDEX_WELCOME_LABEL" : "Bienvenue",
                           "INDEX_SEARCH_FREE_SLOT_BUTTON" : "Chercher salles libres",
                           "INDEX_ADMIN_CONSOLE_BUTTON" : "Administration",
                           "INDEX_ACCOUNT_BUTTON" : "Mon compte",
                           "INDEX_LOGIN_BUTTON" : "S'authentifier",
                           "INDEX_LOGOFF_BUTTON" : "Se déconnecter"}
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
    localize.dictionary.push(default_init[localize.language]);
    console.log(localize.language);
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
}]).directive('i18n', ['globalizationService', function(globalizationService){
        var i18nDirective = {
            restrict:"EAC",
            updateText:function(elm, token, html){
                var values = token.split('|');
                if (values.length >= 1) {
                    // construct the tag to insert into the element
                    var tag = globalizationService.getLocalizedString(values[0]);
                    // update the element only if data was returned
                    if ((tag !== null) && (tag !== undefined) && (tag !== '')) {
                        if (values.length > 1) {
                            for (var index = 1; index < values.length; index++) {
                                var target = '{' + (index - 1) + '}';
                                tag = tag.replace(target, values[index]);
                            }
                        }
                        // insert the text into the element
                        elm[html ? 'html':'text'](tag);
                    }
                }
            },

            link:function (scope, elm, attrs) {
                scope.$on('localizeResourcesUpdated', function() {
                    i18nDirective.updateText(elm, attrs.i18n, angular.isDefined(attrs.i18nHtml));
                });

                attrs.$observe('i18n', function (value) {
                    i18nDirective.updateText(elm, attrs.i18n, angular.isDefined(attrs.i18nHtml));
                });
            }
        };

        return i18nDirective;
    }]).directive('i18nAttr', ['globalizationService', function (globalizationService) {
        var i18NAttrDirective = {
            restrict: "EAC",
            updateText:function(elm, token){
                var values = token.split('|');
                // construct the tag to insert into the element
                var tag = globalizationService.getLocalizedString(values[0]);
                // update the element only if data was returned
                if ((tag !== null) && (tag !== undefined) && (tag !== '')) {
                    if (values.length > 2) {
                        for (var index = 2; index < values.length; index++) {
                            var target = '{' + (index - 2) + '}';
                            tag = tag.replace(target, values[index]);
                        }
                    }
                    // insert the text into the element
                    elm.attr(values[1], tag);
                }
            },
            link: function (scope, elm, attrs) {
                scope.$on('localizeResourcesUpdated', function() {
                    i18NAttrDirective.updateText(elm, attrs.i18nAttr);
                });

                attrs.$observe('i18nAttr', function (value) {
                    i18NAttrDirective.updateText(elm, value);
                });
            }
        };

        return i18NAttrDirective;
    }]);