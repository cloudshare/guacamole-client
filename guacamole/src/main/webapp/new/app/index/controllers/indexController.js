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
 * The controller for the root of the application.
 */
angular.module('index').controller('indexController', ['$scope', 'permissionDAO', 'permissionCheckService', 'localStorageUtility',
        function indexController($scope, permissionDAO, permissionCheckService, localStorageUtility) {
    
    // Put some useful variables in the top level scope
    $scope.currentUserID = localStorageUtility.get('userID');
    $scope.currentUserIsAdmin = false;
    $scope.currentUserHasAdmin = false;
    $scope.currentUserPermissions = null;
    
    permissionDAO.getPermissions($scope.currentUserID).success(function fetchCurrentUserPermissions(permissions) {
        $scope.currentUserPermissions = permissions;
        
        // Will be true if the user is an admin
        $scope.currentUserIsAdmin = permissionCheckService.checkPermission($scope.currentUserPermissions, "SYSTEM", undefined, "ADMINISTER");
        
        // Will be true if the user is an admin or has admin access to any object               
        $scope.currentUserHasAdmin = $scope.currentUserIsAdmin || 
                permissionCheckService.checkPermission($scope.currentUserPermissions, undefined, undefined, "ADMINISTER");
    });
}]);
