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
        userDAO.saveUser($scope.user).success(function successfullyUpdatedUser() {
            
            // Copy the data back to the original model
            angular.extend(oldUser, $scope.user);
            
            // Close the modal
            userEditModal.deactivate();
        });
    };
    
    $scope.permissions = [];
    $scope.administerSystem = false;
    $scope.createUser = false;
    $scope.createConnection = false;
    $scope.createConnectionGroup = false;
    
    // Get the permissions for the user we are editing
    permissionDAO.getPermissions($scope.user.username).success(function gotPermissions(permissions) {
        $scope.permissions = permissions;
        
        // Figure out if the user has any system level permissions
        for(var i = 0; i < $scope.permissions.length; i++) {
            var permission = $scope.permissions[i];
            if(permission.objectType === "SYSTEM") {
                switch(permission.permissionType) {
                    case "CREATE_USER":
                        $scope.createUser = true;
                        break;
                    case "CREATE_CONNECTION":
                        $scope.createConnection = true;
                        break;
                    case "CREATE_CONNECTION_GROUP":
                        $scope.createConnectionGroup = true;
                        break;
                    case "ADMINISTER":
                        $scope.administerSystem = true;
                        break;
                }
            }
        }
        
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
}]);



