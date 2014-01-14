/*! (C) 2014 Glyptodon LLC - glyptodon.org/MIT-LICENSE */

angular.module('login').controller('loginController', ['$scope', 'authenticationService', 'localStorageUtility', '$location',
        function loginController($scope, authenticationService, localStorageUtility, $location) {
            
    $scope.loginError = false;
    
    $scope.login = function login() {
        authenticationService.login($scope.username, $scope.password)
            .success(function success(data, status, headers, config) {
                localStorageUtility.set('authToken', data.authToken);
                $location.path('/');
            }).error(function error(data, status, headers, config) {
                $scope.loginError = true;
            });
    };
}]);
