/*! (C) 2014 Glyptodon LLC - glyptodon.org/MIT-LICENSE */

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
        $location.path("/connect/connection/" + connection.identifier);
    };
    
    /**
     * Connect to the given balancing connection group.
     * 
     * @param {object} group
     */
    $scope.openConnectionGroup = function openConnectionGroup(group) {
        if(group.balancer) {
            $location.path("/connect/connectionGroup/" + group.identifier);
        }
    };
    
    $scope.toggleExpanded = function toggleExpanded(connectionGroup) {
        connectionGroup.expanded = !connectionGroup.expanded;
    };
}]);
