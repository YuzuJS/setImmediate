/*jshint curly: true, eqeqeq: true, immed: true, newcap: true, noarg: true, nonew: true, undef: true, white: true, trailing: true */

/* setImmediate.js
 *
 * A cross-browser setImmediate and clearImmediate:
 * https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
 * Uses one of the following implementations:
 *  - Native msSetImmediate/msClearImmediate in IE10
 *  - MessageChannel in supporting (very recent) browsers: advantageous because it works in a web worker context.
 *  - postMessage in Firefox 3+, Internet Explorer 9+, WebKit, and Opera 9.5+ (except where MessageChannel is used)
 *  - setTimeout(..., 0) in all other browsers.
 * In other words, setImmediate and clearImmediate are safe in all browsers.
 *
 * Copyright © 2011 Barnesandnoble.com, llc and Donavon West
 * Released under MIT license (see MIT-LICENSE.txt)
 */

(function (global) {
    function executeHandler(handler, thisObj, args) {
        if (handler.apply) {
            handler.apply(thisObj, args);
        } else {
            throw new Error("setImmediate.js: shoot me now! there's no way I'm implementing an evaluated handler!");
        }
    }

    function hasMicrosoftImplementation() {
        return !!(global.msSetImmediate && global.msClearImmediate);
    }

    function canUseMessageChannel() {
        return !!global.MessageChannel;
    }

    function canUsePostMessage() {
        // The test against importScripts prevents this implementation from being installed inside a web worker,
        // where postMessage means something completely different and can't be used for this purpose.

        if (!global.postMessage || global.importScripts) {
            return false;
        }

        var postMessageIsAsynchronous = true;
        var oldOnMessage = window.onmessage;
        window.onmessage = function () {
            postMessageIsAsynchronous = false;
        };
        window.postMessage("", "*");
        window.onmessage = oldOnMessage;

        return postMessageIsAsynchronous;
    }

    function installMicrosoftImplementation(attachTo) {
        attachTo.setImmediate = global.msSetImmediate;
        attachTo.clearImmediate = global.msClearImmediate;
    }

    function installMessageChannelImplementation(attachTo) {
        var currentHandle = 1; // Handle MUST be non-zero, says the spec.
        var executingHandles = {}; // Used as a "set", i.e. keys are handles and values don't matter.

        attachTo.setImmediate = function (handler/*[, args]*/) {
            var thisObj = this;
            var args = Array.prototype.slice.call(arguments, 1);

            currentHandle++;

            // Create a channel and immediately post a message to it with the current handle.
            var channel = new global.MessageChannel();
            channel.port1.onmessage = function (event) {
                var theHandle = event.data;

                // The message posted includes the handle; make sure that handle hasn't been cleared.
                if (executingHandles.hasOwnProperty(theHandle)) {
                    delete executingHandles[theHandle];
                    executeHandler(handler, thisObj, args);
                }
            };
            channel.port2.postMessage(currentHandle);

            // Add this handle to the executingHandles set, then return it.
            executingHandles[currentHandle] = true;
            return currentHandle;
        };

        attachTo.clearImmediate = function (handle) {
            // Clear a handle by removing it from the executingHandles set, so that when the message is received,
            // nothing happens.
            delete executingHandles[handle];
        };
    }

    function installPostMessageImplementation(attachTo) {
        var handle = 1; // Handle MUST be non-zero, says the spec.
        var immediates = [];
        var MESSAGE_NAME = "com.bn.NobleJS.setImmediate";

        function handleMessage(event) {
            if (event.source === global && event.data === MESSAGE_NAME) {
                if (event.stopPropagation) {	// IE8 does not have this
                    event.stopPropagation();
                }

                if (immediates.length > 0) {
                    var immediate = immediates.shift();
                    executeHandler(immediate.handler, immediate.thisObj, immediate.args);
                }
            }
        }

        if (global.addEventListener) {
            global.addEventListener("message", handleMessage, false);
        } else {
            global.attachEvent("onmessage", handleMessage);
        }

        attachTo.setImmediate = function (handler/*[, args]*/) {
            var args = Array.prototype.slice.call(arguments, 1);
            var task = { handle: handle, handler: handler, args: args, thisObj: this };
            immediates.push(task);

            global.postMessage(MESSAGE_NAME, "*");
            return handle++;
        };

        attachTo.clearImmediate = function (handle) {
            for (var i = 0; i < immediates.length; i++) {
                if (immediates[i].handle === handle) {
                    immediates.splice(i, 1); // Remove the task
                    break;
                }
            }
        };
    }

    function installSetTimeoutImplementation(attachTo) {
        attachTo.setImmediate = function (handler /*[, args]*/) {
            var thisObj = this;
            var args = Array.prototype.slice.call(arguments, 1);

            return global.setTimeout(function () {
                executeHandler(handler, thisObj, args);
            }, 0);
        };

        attachTo.clearImmediate = global.clearTimeout;
    }

    if (!global.setImmediate) {
        // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
        var attachTo = typeof Object.getPrototypeOf === "function" && "setTimeout" in Object.getPrototypeOf(global) ?
                          Object.getPrototypeOf(global)
                        : global;

        if (hasMicrosoftImplementation()) {
            // For IE10
            installMicrosoftImplementation(attachTo);
        } else if (canUseMessageChannel()) {
            // For super-modern browsers; also works inside web workers.
            installMessageChannelImplementation(attachTo);
        } else if (canUsePostMessage()) {
            // For modern browsers.
        	installPostMessageImplementation(attachTo);
        } else {
            // For older browsers.
            installSetTimeoutImplementation(attachTo);
        }
    }
}(this));
