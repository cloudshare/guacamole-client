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
 * The controller for the page used to connect to a connection or balancing group.
 */
angular.module('home').controller('clientController', ['$scope', '$routeParams', 'localStorageUtility', '$injector',
        function clientController($scope, $routeParams, localStorageUtility, $injector) {
      
    // Store the old title
    var oldTitle = window.document.title;
    
    var $filter = $injector.get('$filter');
    
    // Client settings and state
    $scope.clientParameters = {scale: 1};
            
    /*
     * Parse the type, name, and id out of the url paramteres, 
     * as well as any extra parameters if set.
     */
    $scope.type                 = $routeParams.type;
    $scope.id                   = $routeParams.id;
    $scope.connectionName       = $routeParams.name;
    $scope.connectionParameters = $routeParams.params || '';
    
    $scope.$on('guacClientError', function errorListener(event, statusCode, guacClient, reconnectionCallback) {
        $scope.errorPresent = true;
        
        var statusTranslationCode = 'client.error.clientErrors.' + statusCode;
        
        var translation = $filter('translate')(statusTranslationCode);
        
        // No translation for this error exists, use the default error message
        if (translation === statusTranslationCode)
            translation = $filter('translate')('client.error.clientErrors.DEFAULT');
        
        $scope.errorStatus = translation;
        
        // Close the modal and reconnect
        $scope.reconnect = function reconnect() {
            reconnectionCallBack();
            $scope.errorPresent = false;
        };
    });
    
}]);
