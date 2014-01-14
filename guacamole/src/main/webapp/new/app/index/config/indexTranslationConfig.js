/*! (C) 2014 Glyptodon LLC - glyptodon.org/MIT-LICENSE */

angular.module('index').config(['$translateProvider', function($translateProvider) {
    $translateProvider.preferredLanguage('en_US');

    $translateProvider.useStaticFilesLoader({
        prefix: 'translations/',
        suffix: '.json'
    });
}]);