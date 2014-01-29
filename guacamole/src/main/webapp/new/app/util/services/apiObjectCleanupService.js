/*
 * Copyright (C) 2014 Glyptodon LLC
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

/**
 * A service to help clean up objects to be saved to the REST API.
 */
angular.module('util').factory('apiObjectCleanupService', [function apiObjectCleanupService() {
    var service = {};
    
    /**
     * Creates a clean object, ready to be saved to the REST API, that will only
     * have properties defined in apiProperties. If object does not have the property
     * set, but apiProperties does, the property value from apiProperties will
     * be copied to the new object.
     * 
     * @param {object} object The object to be cleaned.
     * @param {object} apiProperties The set of allowed properties and/or 
     *                               defaults for those properties.
     * @returns {object} A cleaned copy of the original object.
     */
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
