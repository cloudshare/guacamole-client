/*! (C) 2014 Glyptodon LLC - glyptodon.org/MIT-LICENSE */

angular.module('connectionGroup').factory('connectionGroupDAO', ['$http', 'localStorageUtility',
        function connectionGrouDAO($http, localStorageUtility) {
            
    var service = {};
    
    service.getConnectionGroups = function getConnectionGroups(parentID) {
        
        var parentIDParam = "";
        if(parentID !== undefined)
            parentIDParam = "&parentID=" + parentID;
        
        return $http.get("../api/connectionGroup?token=" + localStorageUtility.get('authToken') + parentIDParam);
    };
    
    return service;
}]);
