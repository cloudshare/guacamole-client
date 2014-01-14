/*! (C) 2014 Glyptodon LLC - glyptodon.org/MIT-LICENSE */

angular.module('index').factory('authenticationService', ['$http', 
        function authenticationService($http) {
    var service = {};
    
    service.login = function login(username, password) {
        return $http.post("../api/login?username=" + username +"&password=" + password);
    };
    
    return service;
}]);
