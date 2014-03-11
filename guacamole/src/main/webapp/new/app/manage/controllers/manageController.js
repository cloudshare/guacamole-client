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
 * The controller for the administration page.
 */
angular.module('manage').controller('manageController', ['$scope', '$injector', 
        function manageController($scope, $injector) {
            
    // Get the dependencies commonJS style
    var connectionGroupService  = $injector.get('connectionGroupService');
    var connectionEditModal     = $injector.get('connectionEditModal');
    var protocolDAO             = $injector.get('protocolDAO');
    
    // All the connections and connection groups in root
    $scope.connectionsAndGroups = [];
    
    $scope.basicPermissionsLoaded.then(function basicPermissionsHaveBeenLoaded() {
        connectionGroupService.getAllGroupsAndConnections([], undefined, true, true).then(function filterConnectionsAndGroups(rootGroupList) {
            $scope.rootGroup = rootGroupList[0];
            $scope.connectionsAndGroups = $scope.rootGroup.children;
            
            // Filter the items to only include ones that we have UPDATE for
            if(!$scope.currentUserIsAdmin) {
                connectionGroupService.filterConnectionsAndGroupByPermission(
                    $scope.connectionsAndGroups,
                    $scope.currentUserPermissions,
                    {
                        'CONNECTION':       'UPDATE',
                        'CONNECTION_GROUP': 'UPDATE'
                    }
                );
            }
        });
    });
    
    /**
     * Move the connection or connection group within the group heirarchy.
     * @param {object} item The connection or connection group to move.
     * @param {string} fromID The ID of the group to move the item from.
     * @param {string} toID The ID of the group to move the item to.
     */
    $scope.moveItem = function moveItem(item, fromID, toID) {
        var oldParent   = findGroup($scope.rootGroup, fromID),
            oldChildren = oldParent.children,
            newParent   = findGroup($scope.rootGroup, toID),
            newChildren = newParent.children;
            
        // Find and remove the item from the old group
        for(var i = 0; i < oldChildren.length; i++) {
            var child = oldChildren[i];
            if(child.isConnection === item.isConnection &&
                    child.identifier === item.identifier) {
                oldChildren.splice(i, 1);
                break;
            }
        }
        
        // Add it to the new group
        newChildren.push(item);
    };
    
    function findGroup(group, parentID) {
        // Only searching in groups
        if(group.isConnection)
            return;
        
        if(group.identifier === parentID)
            return group;
        
        for(var i = 0; i < group.children.length; i++) {
            var child = group.children[i];
            var foundGroup = findGroup(child, parentID);
            if(foundGroup) return foundGroup;
        }
    }
        
    
    $scope.protocols = {};
    
    // Get the protocol information from the server and copy it into the scope
    protocolDAO.getProtocols().success(function fetchProtocols(protocols) {
        angular.extend($scope.protocols, protocols);
    });
    
    /**
     * Toggle the open/closed status of the connectionGroup.
     * 
     * @param {object} connectionGroup The connection group to toggle.
     */
    $scope.toggleExpanded = function toggleExpanded(connectionGroup) {
        connectionGroup.expanded = !connectionGroup.expanded;
    };
    
    /**
     * Open a modal to edit the connection
     *  
     * @param {object} connection The connection to edit.
     */
    $scope.editConnection = function editConnection(connection) {
        connectionEditModal.activate(
        {
            connection : connection, 
            protocols  : $scope.protocols,
            moveItem   : $scope.moveItem,
            rootGroup  : $scope.rootGroup
        });
    };
}]);



