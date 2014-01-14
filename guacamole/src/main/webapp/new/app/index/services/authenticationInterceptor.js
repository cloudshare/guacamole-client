/*! (C) 2014 Glyptodon LLC - glyptodon.org/MIT-LICENSE */

angular.module('index').factory('authenticationInterceptor', ['$location', '$q', 
        function authenticationInterceptor($location, $q) {
            
    return {
        'response': function(response) {
            return response || $q.when(response);
        },

        'responseError': function(rejection) {
            // Do not redirect failed login requests to the login page.
            if (rejection.status === 401 && rejection.config.url.search('/api/login') === -1) {
                $location.path('/login');
            }
            return $q.reject(rejection);
        }
    };
}]);
