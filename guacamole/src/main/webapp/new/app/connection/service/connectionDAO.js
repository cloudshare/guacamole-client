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
 * The DAO for connection operations agains the REST API.
 */
angular.module('connection').factory('connectionDAO', ['$http', 'localStorageUtility',
        function connectionDAO($http, localStorageUtility) {
            
    var service = {};
    
    /**
     * Makes a request to the REST API to get the list of connections,
     * returning a promise that can be used for processing the results of the call.
     * 
     * @param {string} parentID The parent ID for the connection.
     *                          If not passed in, it will query a list of the 
     *                          connections in the root group.
     *                          
     * @returns {promise} A promise for the HTTP call.
     */
    service.getConnections = function getConnections(parentID) {
        
        var parentIDParam = "";
        if(parentID !== undefined)
            parentIDParam = "&parentID=" + parentID;
        
        return $http.get("../api/connection?token=" + localStorageUtility.get('authToken') + parentIDParam);
    };
    
    /**
     * Makes a request to the REST API to save a connection,
     * returning a promise that can be used for processing the results of the call.
     * 
     * @param {object} connection The connection to update
     *                          
     * @returns {promise} A promise for the HTTP call.
     */
    service.saveConnection = function saveConnection(connection) {
        // This is a new connection
        if(!connection.identifier) {
            return $http.post("../api/connection/?token=" + localStorageUtility.get('authToken'), connection).success(
                function setConnectionID(connectionID){
                    // Set the identifier on the new connection
                    connection.identifier = connectionID;
                    return connectionID;
                });
        } else {
            return $http.post(
                "../api/connection/" + connection.identifier + 
                "?token=" + localStorageUtility.get('authToken'), 
            connection);
        }
    };
    
    /**
     * Makes a request to the REST API to move a connection to a different group,
     * returning a promise that can be used for processing the results of the call.
     * 
     * @param {object} connection The connection to move. 
     *                          
     * @returns {promise} A promise for the HTTP call.
     */
    service.moveConnection = function moveConnection(connection) {
        
        return $http.put(
            "../api/connection/" + connection.identifier + 
            "?token=" + localStorageUtility.get('authToken') + 
            "&parentID=" + connection.parentIdentifier, 
        connection);
        
    };
    
    /**
     * Makes a request to the REST API to delete a connection,
     * returning a promise that can be used for processing the results of the call.
     * 
     * @param {object} connection The connection to delete
     *                          
     * @returns {promise} A promise for the HTTP call.
     */
    service.deleteConnection = function deleteConnection(connection) {
        return $http['delete'](
            "../api/connection/" + connection.identifier + 
            "?token=" + localStorageUtility.get('authToken'));
    };
    
    return service;
}]);
