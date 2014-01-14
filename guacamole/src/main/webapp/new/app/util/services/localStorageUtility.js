/*! (C) 2014 Glyptodon LLC - glyptodon.org/MIT-LICENSE */

angular.module('util').factory('localStorageUtility', ['$cookieStore', 
        function localStorageUtility($cookieStore) {
        
    var service = {};
    
    // The prefix to use when storing cookies
    var COOKIE_PREFIX = "guacamole.ui.localstorage.";
    
    // Check if we can actually use localStorage
    var localStorageEnabled;
    try {
        window.localStorage.setItem("test", "test");
        window.localStorage.removeItem("test");
        localStorageEnabled = true;
    } catch(e) {
        localStorageEnabled = false;
    }
    
    if(localStorageEnabled) {
        
        // Just a passthrough to localStorage
        service.get = function get(key) {
            return window.localStorage.getItem(key);
        };

        service.set = function set(key, value) {
            return window.localStorage.setItem(key, value);
        };
    }
    else {
        
        // Store the values as cookies
        service.get = function getValueFromCookie(key) {
            return $cookieStore.get(COOKIE_PREFIX + key);
        };
        
        service.set = function setValueOnCookie(key, value) {
            return $cookieStore.put(COOKIE_PREFIX + key, value);
        }
    }
    
    return service;
}]);
