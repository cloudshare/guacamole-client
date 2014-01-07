/*
 * Copyright (C) 2013 Glyptodon LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

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
