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

angular.module('home').controller('homeController', ['$scope', 'connectionDAO', 'connectionGroupDAO', 'localStorageUtility', '$location',
        function homeController($scope, connectionDAO, connectionGroupDAO, localStorageUtility, $location) {
            
    $scope.manage = function manage() {
        $location.path("/manage");
    };
    
    $scope.logout = function logout() {
        
        // Clear the auth token to log out the user
        localStorageUtility.clear("authToken");
        
        // Redirect to login page
        $location.path("/login");
    };
    
    $scope.items = [];
    
    // Add all connections and balancing groups from this group to the all connection list
    function addToAllConnections(connectionGroup, parentGroup) {
        parentGroup.items.push(connectionGroup);
        
        connectionGroup.isConnection = false;
            
        connectionGroup.balancer = connectionGroup.type !== "ORGANIZATIONAL";
        connectionGroup.expanded = false;
        connectionGroup.items = [];

        // Get all connections in the ORGANIZATIONAL group and add them under this connection group
        connectionDAO.getConnections(connectionGroup.identifier).success(function fetchConnections(connections) {
            for(var i = 0; i < connections.length; i++) {
                connections[i].isConnection = true;
                connectionGroup.items.push(connections[i]);
            }
        });

        // Get all connection groups in the ORGANIZATIONAL group and repeat
        connectionGroupDAO.getConnectionGroups(connectionGroup.identifier).success(function fetchConnectionGroups(connectionGroups) {
            for(var i = 0; i < connectionGroups.length; i++) {
                addToAllConnections(connectionGroups[i], connectionGroup);
            }
        });
    }
    
    // Get the root connection groups and begin building out the tree
    connectionGroupDAO.getConnectionGroups().success(function fetchRootConnectionGroups(connectionGroups) {
        for(var i = 0; i < connectionGroups.length; i++) {
            addToAllConnections(connectionGroups[i], $scope);
        }
        
        // Get all connections in the root group and add them under this connection group
        connectionDAO.getConnections().success(function fetchRootConnections(connections) {
            for(var i = 0; i < connections.length; i++) {
                connections[i].isConnection = true;
                $scope.items.push(connections[i]);
            }
            
        });
    });
    
    /**
     * Connect to the given connection.
     * 
     * @param {object} connection
     */
    $scope.openConnection = function openConnection(connection) {
        $location.path("/client/c/" + connection.identifier);
    };
    
    /**
     * Connect to the given balancing connection group.
     * 
     * @param {object} group
     */
    $scope.openConnectionGroup = function openConnectionGroup(group) {
        if(group.balancer) {
            $location.path("/client/cg/" + group.identifier);
        }
    };
    
    $scope.toggleExpanded = function toggleExpanded(connectionGroup) {
        connectionGroup.expanded = !connectionGroup.expanded;
    };
}]);
