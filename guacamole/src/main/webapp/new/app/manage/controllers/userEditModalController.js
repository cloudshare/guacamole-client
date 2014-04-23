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
 * The controller for the connection edit modal.
 */
angular.module('manage').controller('userEditModalController', ['$scope', '$injector', 
        function userEditModalController($scope, $injector) {
            
    var userEditModal                   = $injector.get('userEditModal');
    var userDAO                         = $injector.get('userDAO');
    var permissionDAO                   = $injector.get('permissionDAO');
    
    // Make a copy of the old user so that we can copy over the changes when done
    var oldUser = $scope.user;
    
    // Copy data into a new conection object in case the user doesn't want to save
    $scope.user = angular.copy($scope.user);
    
    /**
     * Close the modal.
     */
    $scope.close = function close() {
        userEditModal.deactivate();
    };
    
    /**
     * Save the user and close the modal.
     */
    $scope.save = function save() {
        
        if($scope.passwordMatch !== $scope.user.password) {
            //TODO: Display an error
            return;
        }
        
        userDAO.saveUser($scope.user).success(function successfullyUpdatedUser() {
            
            //Figure out what permissions have changed
            var connectionPermissionsToCreate = [],
                connectionPermissionsToDelete = [],
                connectionGroupPermissionsToCreate = [],
                connectionGroupPermissionsToDelete = [],
                systemPermissionsToCreate = [],
                systemPermissionsToDelete = [];
                
            for(var connectionID in $scope.connectionPermissions) {
                if(!originalConnectionPermissions[connectionID]) {
                    //The permission exists in the new set, but not the old - create it!
                    connectionPermissionsToCreate.push(connectionID);
                }
            }
                
            for(var connectionID in originalConnectionPermissions) {
                if(!$scope.connectionPermissions[connectionID]) {
                    //The permission exists in the old set, but not the new - delete it!
                    connectionPermissionsToDelete.push(connectionID);
                }
            }
                
            for(var connectionGroupID in $scope.connectionGroupPermissions) {
                if(!originalConnectionGroupPermissions[connectionGroupID]) {
                    //The permission exists in the new set, but not the old - create it!
                    connectionGroupPermissionsToCreate.push(connectionGroupID);
                }
            }
                
            for(var connectionGroupID in originalConnectionGroupPermissions) {
                if(!$scope.connectionGroupPermissions[connectionGroupID]) {
                    //The permission exists in the old set, but not the new - delete it!
                    connectionGroupPermissionsToDelete.push(connectionGroupID);
                }
            }
                
            for(var permissionType in $scope.systemPermissions) {
                if(!originalSystemPermissions[permissionType]) {
                    //The permission exists in the new set, but not the old - create it!
                    systemPermissionsToCreate.push(permissionType);
                }
            }
                
            for(var permissionType in originalSystemPermissions) {
                if(!$scope.systemPermissions[permissionType]) {
                    //The permission exists in the old set, but not the new - delete it!
                    systemPermissionsToDelete.push(permissionType);
                }
            }
            
            var permissionsToAdd = [];
            var permissionsToRemove = [];
            
            // Create new connection permissions
            for(var i = 0; i < connectionPermissionsToCreate.length; i++) {
                permissionsToAdd.push({
                    objectType :        "CONNECTION",
                    objectIdentifier :  connectionPermissionsToCreate[i],
                    permissionType :    "READ"
                });
            }
            
            // Delete old connection permissions
            for(var i = 0; i < connectionPermissionsToDelete.length; i++) {
                permissionsToRemove.push({
                    objectType :        "CONNECTION",
                    objectIdentifier :  connectionPermissionsToDelete[i],
                    permissionType :    "READ"
                });
            }
            
            // Create new connection group permissions
            for(var i = 0; i < connectionGroupPermissionsToCreate.length; i++) {
                permissionsToAdd.push({
                    objectType :        "CONNECTION_GROUP",
                    objectIdentifier :  connectionGroupPermissionsToCreate[i],
                    permissionType :    "READ"
                });
            }
            
            // Delete old connection group permissions
            for(var i = 0; i < connectionGroupPermissionsToDelete.length; i++) {
                permissionsToRemove.push({
                    objectType :        "CONNECTION_GROUP",
                    objectIdentifier :  connectionGroupPermissionsToDelete[i],
                    permissionType :    "READ"
                });
            }
            
            // Create new system permissions
            for(var i = 0; i < systemPermissionsToCreate.length; i++) {
                permissionsToAdd.push({
                    objectType :        "SYSTEM",
                    permissionType :    systemPermissionsToCreate[i]
                });
            }
            
            // Delete old system permissions
            for(var i = 0; i < systemPermissionsToDelete.length; i++) {
                permissionsToRemove.push({
                    objectType :        "SYSTEM",
                    permissionType :    systemPermissionsToDelete[i]
                });
            }
        
            function completeSaveProcess() {
                // Close the modal
                userEditModal.deactivate();
            }
            
            function handleFailure() {
                //TODO: Handle the permission API call failure
            }
            
            if(permissionsToAdd.length || permissionsToRemove.length) {
                // Make the call to update the permissions
                permissionDAO.patchPermissions(
                        $scope.user.username, permissionsToAdd, permissionsToRemove)
                        .success(completeSaveProcess).error(handleFailure);
            } else {
                completeSaveProcess();
            }
            
        });
    };
    
    $scope.permissions = [];

    // Maps of connection and connection group IDs to access permission booleans
    $scope.connectionPermissions = {};
    $scope.connectionGroupPermissions = {};
    $scope.systemPermissions = {};
    
    // The original permissions to compare against 
    var originalConnectionPermissions,
        originalConnectionGroupPermissions,
        originalSystemPermissions;
    
    // Get the permissions for the user we are editing
    permissionDAO.getPermissions($scope.user.username).success(function gotPermissions(permissions) {
        $scope.permissions = permissions;
        
        // Figure out if the user has any system level permissions
        for(var i = 0; i < $scope.permissions.length; i++) {
            var permission = $scope.permissions[i];
            if(permission.objectType === "SYSTEM") {
                
                $scope.systemPermissions[permission.permissionType] = true;
                
            // Only READ permission is editable via this UI
            } else if (permission.permissionType === "READ") {
                switch(permission.objectType) {
                    case "CONNECTION":
                        $scope.connectionPermissions[permission.objectIdentifier] = true;
                        break;
                    case "CONNECTION_GROUP":
                        $scope.connectionGroupPermissions[permission.objectIdentifier] = true;
                        break;
                }
            }
        }
        
        // Copy the original permissions so we can compare later
        originalConnectionPermissions = angular.copy($scope.connectionPermissions);
        originalConnectionGroupPermissions = angular.copy($scope.connectionGroupPermissions);
        originalSystemPermissions = angular.copy($scope.systemPermissions);
        
    });
    
    /**
     * Delete the user and close the modal.
     */
    $scope['delete'] = function deleteUser() {
        userDAO.deleteUser($scope.user).success(function successfullyDeletedUser() {
            
            // Remove the user from the list
            $scope.removeUser($scope.user);
            
            // Close the modal
            userEditModal.deactivate();
        });
    }
    
    /**
     * Toggle the open/closed status of the connectionGroup.
     * 
     * @param {object} connectionGroup The connection group to toggle.
     */
    $scope.toggleExpanded = function toggleExpanded(connectionGroup) {
        connectionGroup.expanded = !connectionGroup.expanded;
    };
}]);



