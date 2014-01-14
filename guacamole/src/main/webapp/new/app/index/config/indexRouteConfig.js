/*! (C) 2014 Glyptodon LLC - glyptodon.org/MIT-LICENSE */

angular.module('index').config(['$routeProvider', '$locationProvider', 
        function indexRouteConfig($routeProvider, $locationProvider) {
            
    // Disable HTML5 mode (use # for routing)
    $locationProvider.html5Mode(false);
    
    $routeProvider.
      when('/', {
        templateUrl: 'app/home/templates/home.html',
        controller: 'homeController'
      }).
      when('/manage/', {
        templateUrl: 'app/manage/templates/manage.html',
        controller: 'manageController'
      }).
      when('/login/', {
        templateUrl: 'app/login/templates/login.html',
        controller: 'loginController'
      }).
      otherwise({
        redirectTo: '/'
      });
      
}]);


