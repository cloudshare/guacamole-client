/*! (C) 2014 Glyptodon LLC - glyptodon.org/MIT-LICENSE */

angular.module('home').controller('connectionRouteController', ['$scope', '$route', '$routeParams', '$http', '$compile',
        function connectionRouteController($scope, $route, $routeParams, $http, $compile) {
    $route.current.templateUrl = '../client.xhtml?id=c%2F' + $routeParams.connectionID;
    
    $http.get($route.current.templateUrl).then(function (msg) {
        $('#content').html($compile(msg.data)($scope));
    });
}]);

