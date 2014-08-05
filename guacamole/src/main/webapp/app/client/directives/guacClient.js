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
 * A directive for the guacamole client.
 */
angular.module('client').directive('guacClient', [function guacClient() {
    
    return {
        // Element only
        restrict: 'E',
        replace: true,
        scope: {
            // Parameters for controlling client state
            clientParameters        : '=',
            
            // Parameters for initially connecting
            id                      : '=',
            type                    : '=',
            connectionName          : '=', 
            connectionParameters    : '='
        },
        templateUrl: 'app/client/templates/guacClient.html',
        controller: ['$scope', '$injector', '$element', function guacClientController($scope, $injector, $element) {
                
            var $window             = $injector.get('$window'),
                guacAudio           = $injector.get('guacAudio'),
                guacVideo           = $injector.get('guacVideo'),
                localStorageUtility = $injector.get('localStorageUtility');
                
            var authToken = localStorageUtility.get('authToken'),
                uniqueId  = encodeURIComponent($scope.type + '/' + $scope.id);
                
            // Get elements for DOM manipulation
            $scope.main   = $element[0];
                
            // Settings and constants
            $.extend(true, $scope, {
                
                /**
                 * All error codes for which automatic reconnection is appropriate when a
                 * tunnel error occurs.
                 */
                "tunnel_auto_reconnect": {
                    0x0200: true,
                    0x0202: true,
                    0x0203: true,
                    0x0308: true
                },

                /**
                 * All error codes for which automatic reconnection is appropriate when a
                 * client error occurs.
                 */
                "client_auto_reconnect": {
                    0x0200: true,
                    0x0202: true,
                    0x0203: true,
                    0x0301: true,
                    0x0308: true
                },

                /* Constants */

                "KEYBOARD_AUTO_RESIZE_INTERVAL" : 30,  /* milliseconds */
                "RECONNECT_PERIOD"              : 15,  /* seconds */
                "TEXT_INPUT_PADDING"            : 128, /* characters */
                "TEXT_INPUT_PADDING_CODEPOINT"  : 0x200B,

                /* Settings for zoom */
                "min_zoom"        : 1,
                "max_zoom"        : 3,

                /* Current connection parameters */

                /* The user defined named for this connection */
                "connectionName"        : "Guacamole", 

                /* The connection name recieved when connecting, used in the title */
                "connectionDisplayName" : "Guacamole",
                "uniqueId"              : null,
                "attachedClient"        : null,

                /* Mouse emulation */

                "emulate_absolute" : true,
                "touch"            : null,
                "touch_screen"     : null,
                "touch_pad"        : null,

                /* Clipboard */

                "remote_clipboard" : "",
                "clipboard_integration_enabled" : undefined 
            });
            
            /**
             * Updates the scale of the attached Guacamole.Client based on current window
             * size and "auto-fit" setting.
             */
            $scope.updateDisplayScale = function() {

                var guac = $scope.attachedClient;
                if (!guac)
                    return;

                // Determine whether display is currently fit to the screen
                var auto_fit = (guac.getDisplay().getScale() === $scope.min_zoom);

                // Calculate scale to fit screen
                $scope.min_zoom = Math.min(
                    $scope.main.offsetWidth / Math.max(guac.getDisplay().getWidth(), 1),
                    $scope.main.offsetHeight / Math.max(guac.getDisplay().getHeight(), 1)
                );

                // Calculate appropriate maximum zoom level
                $scope.max_zoom = Math.max($scope.min_zoom, 3);

                // Clamp zoom level, maintain auto-fit
                if (guac.getDisplay().getScale() < $scope.min_zoom || auto_fit)
                    $scope.setScale($scope.min_zoom);

                else if (guac.getDisplay().getScale() > $scope.max_zoom)
                    $scope.setScale($scope.max_zoom);

            };
            
            /**
             * Attaches a Guacamole.Client to the client UI, such that Guacamole events
             * affect the UI, and local events affect the Guacamole.Client. If a client
             * is already attached, it is replaced.
             * 
             * @param {Guacamole.Client} guac The Guacamole.Client to attach to the UI.
             */
            $scope.attach = function(guac) {

               // If a client is already attached, ensure it is disconnected
               if ($scope.attachedClient)
                   $scope.attachedClient.disconnect();

               // Store attached client
               $scope.attachedClient = guac;

               // Get display element
               var guac_display = guac.getDisplay().getElement();

               /*
                * Update the scale of the display when the client display size changes.
                */

               guac.getDisplay().onresize = function() {
                   $scope.updateDisplayScale();
               };

               /*
                * Update UI when the state of the Guacamole.Client changes.
                */

               //TODO : FIX THIS
               /*guac.onstatechange = function(clientState) {

                   switch (clientState) {

                       // Idle
                       case 0:
                           GuacUI.Client.showStatus(null, "Idle.");
                           GuacUI.Client.titlePrefix = "[Idle]";
                           break;

                       // Connecting
                       case 1:
                           GuacUI.Client.showStatus("Connecting", "Connecting to Guacamole...");
                           GuacUI.Client.titlePrefix = "[Connecting...]";
                           break;

                       // Connected + waiting
                       case 2:
                           GuacUI.Client.showStatus("Connecting", "Connected to Guacamole. Waiting for response...");
                           GuacUI.Client.titlePrefix = "[Waiting...]";
                           break;

                       // Connected
                       case 3:

                           GuacUI.Client.hideStatus();
                           GuacUI.Client.titlePrefix = null;

                           // Update clipboard with current data
                           var clipboard = GuacamoleSessionStorage.getItem("clipboard");
                           if (clipboard)
                               GuacUI.Client.setClipboard(clipboard);

                           break;

                       // Disconnecting / disconnected are handled by tunnel instead
                       case 4:
                       case 5:
                           break;

                       // Unknown status code
                       default:
                           GuacUI.Client.showStatus("Unknown Status", "An unknown status code was received. This is most likely a bug.");

                   }
                };*/

                /*
                 * Emit a name change event
                 */
                guac.onname = function(name) {
                    $scope.connectionDisplayName = name;
                    $scope.$emit('name', name, guac);
                };

                /*
                 * Disconnect and emits an error when the client receives an error
                 */
                guac.onerror = function(status) {

                    // Disconnect, if connected
                    guac.disconnect();
                    
                    $scope.$emit('guacClientError', status.code, guac, function reconnect () {
                        // TODO: Do something
                    });

                };

                // Server copy handler
                guac.onclipboard = function(stream, mimetype) {

                    // Only text/plain is supported for now
                    if (mimetype !== "text/plain") {
                        stream.sendAck("Only text/plain supported", Guacamole.Status.Code.UNSUPPORTED);
                        return;
                    }

                    var reader = new Guacamole.StringReader(stream);
                    var data = "";

                    // Append any received data to buffer
                    reader.ontext = function clipboard_text_received(text) {
                        data += text;
                        stream.sendAck("Received", Guacamole.Status.Code.SUCCESS);
                    };

                    // Emit event when done
                    reader.onend = function clipboard_text_end() {
                        $scope.$emit('guacClientClipboard', data, guac);
                    };

                };

                /*
                 * Prompt to download file when file received.
                 */

                guac.onfile = function onfile(stream, mimetype, filename) {

                    // Begin file download
                    var guacFileStartEvent = $scope.$emit('guacFileStart', stream.index, mimetype, filename, guac);
                    if (!guacFileStartEvent.defaultPrevented) {

                        var blob_reader = new Guacamole.BlobReader(stream, mimetype);

                        // Update progress as data is received
                        blob_reader.onprogress = function onprogress() {
                            $scope.$emit('guacFileProgress', stream.index, mimetype, filename, guac);
                            stream.sendAck("Received", Guacamole.Status.Code.SUCCESS);
                        };

                        // When complete, prompt for download
                        blob_reader.onend = function onend() {
                            $scope.$emit('guacFileEnd', stream.index, mimetype, filename, guac);
                        };

                        stream.sendAck("Ready", Guacamole.Status.Code.SUCCESS);
                        
                    }
                    
                    // Respond with UNSUPPORTED if download (default action) canceled within event handler
                    else
                        stream.sendAck("Download canceled", Guacamole.Status.Code.UNSUPPORTED);

                };

                /*
                 * Do nothing when the display element is clicked on.
                 */

                guac_display.onclick = function(e) {
                    e.preventDefault();
                    return false;
                };

                /*
                 * Handle mouse and touch events relative to the display element.
                 */

                // Touchscreen
                var touch_screen = new Guacamole.Mouse.Touchscreen(guac_display);
                $scope.touch_screen = touch_screen;

                // Touchpad
                var touch_pad = new Guacamole.Mouse.Touchpad(guac_display);
                $scope.touch_pad = touch_pad;

                // Mouse
                var mouse = new Guacamole.Mouse(guac_display);
                mouse.onmousedown = mouse.onmouseup = mouse.onmousemove = function(mouseState) {

                    // Scale event by current scale
                    var scaledState = new Guacamole.Mouse.State(
                            mouseState.x / guac.getDisplay().getScale(),
                            mouseState.y / guac.getDisplay().getScale(),
                            mouseState.left,
                            mouseState.middle,
                            mouseState.right,
                            mouseState.up,
                            mouseState.down);

                    // Send mouse event
                    guac.sendMouseState(scaledState);

                };

                //TODO : FIX THIS
                // Hide any existing status notifications
                //GuacUI.Client.hideStatus();
                
                var $display = $element.find('.display');

                // Remove old client from UI, if any
                $display.html("");

                // Add client to UI
                guac.getDisplay().getElement().className = "software-cursor";
                $display.append(guac.getDisplay().getElement());

            };
            
            // Watch for changes to mouse emulation mode
            $scope.$watch('parameters.emulateAbsolute', function(emulateAbsolute) {
                $scope.setMouseEmulationAbsolute(emulateAbsolute);
            });
            
            /**
             * Sets the mouse emulation mode to absolute or relative.
             *
             * @param {Boolean} absolute Whether mouse emulation should use absolute
             *                           (touchscreen) mode.
             */
            $scope.setMouseEmulationAbsolute = function(absolute) {

                function __handle_mouse_state(mouseState) {

                    // Get client - do nothing if not attached
                    var guac = $scope.attachedClient;
                    if (!guac) return;

                    // Determine mouse position within view
                    var guac_display = guac.getDisplay().getElement();
                    var mouse_view_x = mouseState.x + guac_display.offsetLeft - $scope.main.scrollLeft;
                    var mouse_view_y = mouseState.y + guac_display.offsetTop  - $scope.main.scrollTop;

                    // Determine viewport dimensioins
                    var view_width  = $scope.main.offsetWidth;
                    var view_height = $scope.main.offsetHeight;

                    // Determine scroll amounts based on mouse position relative to document

                    var scroll_amount_x;
                    if (mouse_view_x > view_width)
                        scroll_amount_x = mouse_view_x - view_width;
                    else if (mouse_view_x < 0)
                        scroll_amount_x = mouse_view_x;
                    else
                        scroll_amount_x = 0;

                    var scroll_amount_y;
                    if (mouse_view_y > view_height)
                        scroll_amount_y = mouse_view_y - view_height;
                    else if (mouse_view_y < 0)
                        scroll_amount_y = mouse_view_y;
                    else
                        scroll_amount_y = 0;

                    // Scroll (if necessary) to keep mouse on screen.
                    $scope.main.scrollLeft += scroll_amount_x;
                    $scope.main.scrollTop  += scroll_amount_y;

                    // Scale event by current scale
                    var scaledState = new Guacamole.Mouse.State(
                            mouseState.x / guac.getDisplay().getScale(),
                            mouseState.y / guac.getDisplay().getScale(),
                            mouseState.left,
                            mouseState.middle,
                            mouseState.right,
                            mouseState.up,
                            mouseState.down);

                    // Send mouse event
                    guac.sendMouseState(scaledState);

                };

                var new_mode, old_mode;
                $scope.emulate_absolute = absolute;

                // Switch to touchscreen if absolute
                if (absolute) {
                    new_mode = $scope.touch_screen;
                    old_mode = $scope.touch;
                }

                // Switch to touchpad if not absolute (relative)
                else {
                    new_mode = $scope.touch_pad;
                    old_mode = $scope.touch;
                }

                // Perform switch
                if (new_mode) {

                    if (old_mode) {
                        old_mode.onmousedown = old_mode.onmouseup = old_mode.onmousemove = null;
                        new_mode.currentState.x = old_mode.currentState.x;
                        new_mode.currentState.y = old_mode.currentState.y;
                    }

                    new_mode.onmousedown = new_mode.onmouseup = new_mode.onmousemove = __handle_mouse_state;
                    $scope.touch = new_mode;
                }

            };

            /**
             * Updates the document title based on the connection display name.
             */
            $scope.updateTitle = function () {

                if ($scope.titlePrefix)
                    document.title = $scope.titlePrefix + " " + $scope.connectionDisplayName;
                else
                    document.title = $scope.connectionDisplayName;

                $scope.menu_title.textContent = $scope.connectionDisplayName;

            };
                
            /**
             * Connects to the current Guacamole connection, attaching a new Guacamole
             * client to the user interface. If a Guacamole client is already attached,
             * it is replaced.
             */
            $scope.connect = function connect() {
                
                // If WebSocket available, try to use it.
                if ($window.WebSocket)
                    $scope.tunnel = new Guacamole.ChainedTunnel(
                        new Guacamole.WebSocketTunnel("websocket-tunnel"),
                        new Guacamole.HTTPTunnel("tunnel")
                    );

                // If no WebSocket, then use HTTP.
                else
                    $scope.tunnel = new Guacamole.HTTPTunnel("tunnel");

                // Instantiate client
                $scope.guac = new Guacamole.Client($scope.tunnel);

                // Tie UI to client
                $scope.attach($scope.guac);

                // Calculate optimal width/height for display
                var pixel_density = $window.devicePixelRatio || 1;
                var optimal_dpi = pixel_density * 96;
                var optimal_width = $window.innerWidth * pixel_density;
                var optimal_height = $window.innerHeight * pixel_density;

                // Scale width/height to be at least 600x600
                if (optimal_width < 600 || optimal_height < 600) {
                    var scale = Math.max(600 / optimal_width, 600 / optimal_height);
                    optimal_width = optimal_width * scale;
                    optimal_height = optimal_height * scale;
                }

                // Get entire query string, and pass to connect().
                // Normally, only the "id" parameter is required, but
                // all parameters should be preserved and passed on for
                // the sake of authentication.

                var connectString =
                    "id=" + uniqueId + ($scope.connectionParameters ? '&' + $scope.connectionParameters : '')
                    + "&authToken="+ authToken
                    + "&width="    + Math.floor(optimal_width)
                    + "&height="   + Math.floor(optimal_height)
                    + "&dpi="      + Math.floor(optimal_dpi);

                // Add audio mimetypes to connect_string
                guacAudio.supported.forEach(function(mimetype) {
                    connectString += "&audio=" + encodeURIComponent(mimetype);
                });

                // Add video mimetypes to connect_string
                guacVideo.supported.forEach(function(mimetype) {
                    connectString += "&video=" + encodeURIComponent(mimetype);
                });


                //TODO : FIX THIS
                // Show connection errors from tunnel
                /*$scope.tunnel.onerror = function onerror(status) {
                    var message = GuacUI.Client.tunnel_errors[status.code] || GuacUI.Client.tunnel_errors.DEFAULT;
                    GuacUI.Client.showError("Connection Error", message,
                        GuacUI.Client.tunnel_auto_reconnect[status.code] && GuacUI.Client.RECONNECT_PERIOD);
                };*/


                //TODO : FIX THIS
                // Notify of disconnections (if not already notified of something else)
                /*$scope.tunnel.onstatechange = function onstatechange(state) {
                    if (state === Guacamole.Tunnel.State.CLOSED && !GuacUI.Client.visibleStatus)
                        GuacUI.Client.showStatus("Disconnected", "You have been disconnected. Reload the page to reconnect.");
                };*/

                // Connect
                $scope.guac.connect(connectString);
            };

            /**
             * Sets the current display scale to the given value, where 1 is 100% (1:1
             * pixel ratio). Out-of-range values will be clamped in-range.
             * 
             * @param {Number} scale The new scale to apply
             */
            $scope.setScale = function setScale(scale) {

                scale = Math.max(scale, $scope.min_zoom);
                scale = Math.min(scale, $scope.max_zoom);

                if ($scope.attachedClient)
                    $scope.attachedClient.getDisplay().scale(scale);

                return scale;
            };

            // Adjust scale if modified externally
            $scope.$watch('clientParameters.scale', function changeScale(scale) {
                $scope.setScale(scale);
                checkScale();
            });

            // Verify that the scale is within acceptable bounds, and adjust if needed
            function checkScale() {

                // If at minimum zoom level, auto fit is ON
                if ($scope.scale === $scope.min_zoom) {
                    $scope.main.style.overflow = "hidden";
                    $scope.autoFitEnabled = true;
                }

                // If at minimum zoom level, auto fit is OFF
                else {
                    $scope.main.style.overflow = "auto";
                    $scope.autoFitEnabled = false;
                }
            }
    
            // Connect!
            $scope.connect();
        }]
    };
}]);