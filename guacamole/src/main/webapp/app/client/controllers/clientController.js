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
angular.module('home').controller('clientController', ['$scope', '$routeParams', 'localStorageUtility',
        function clientController($scope, $routeParams, localStorageUtility) {
      
    // Store the old title
    var oldTitle = window.document.title;
      
    // Initialize the client
    GuacUI.Client.initialize();
            
    /*
     * Parse the type, name, and id out of the url paramteres, 
     * as well as any extra parameters if set.
     */
    var authToken = localStorageUtility.get('authToken');
    var type      = $routeParams.type;
    var id        = $routeParams.id;
    var name      = $routeParams.name;
    var uniqueId  = encodeURIComponent($routeParams.type + '/' + $routeParams.id);
    
    GuacUI.Client.connect(
        uniqueId,
        name,
        "id=" + uniqueId + ($routeParams.params ? '&' + $routeParams.params : ''), 
        authToken
    );
    
    // Detach the current client if the user navigates away from the current page
    $scope.$on('$locationChangeStart', function(event) {
        
        // Detach the client
        GuacUI.Client.detach();
        
        // Restore the old title
        window.document.title = oldTitle;
    });
    
}]);
