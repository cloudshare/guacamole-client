/*! (C) 2014 Glyptodon LLC - glyptodon.org/MIT-LICENSE */

angular.module('util').factory('apiObjectCleanupService', [function apiObjectCleanupService() {
    var service = {};
    
    service.cleanup = function cleanup(object, apiProperties) {
        var cleanedObject = angular.copy(object);
        for(var property in apiProperties) {
            if(apiProperties.hasOwnProperty(property)) {
                if(!object[property] && apiProperties[property]) {
                    cleanedObject[property] = apiProperties[property];
                }
                else if(object[property]) {
                    cleanedObject[property] = object[property];
                }
            }
        }
        
        return cleanedObject;
    };
    
    return service;
}]);
