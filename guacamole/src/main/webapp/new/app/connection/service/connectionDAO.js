/*! (C) 2014 Glyptodon LLC - glyptodon.org/MIT-LICENSE */

angular.module('connection').factory('connectionDAO', ['$http', 'localStorageUtility',
        function connectionDAO($http, localStorageUtility) {
            
    var service = {};
    
    service.getConnections = function getConnections(parentID) {
        
        var parentIDParam = "";
        if(parentID !== undefined)
            parentIDParam = "&parentID=" + parentID;
        
        return $http.get("../api/connection?token=" + localStorageUtility.get('authToken') + parentIDParam);
    };
    
    return service;
}]);
