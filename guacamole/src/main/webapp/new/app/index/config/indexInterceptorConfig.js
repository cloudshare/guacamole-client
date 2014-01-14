/*! (C) 2014 Glyptodon LLC - glyptodon.org/MIT-LICENSE */

angular.module('index').config(['$httpProvider', 
        function indexInterceptorConfig($httpProvider) {
    $httpProvider.interceptors.push('authenticationInterceptor');
}]);


