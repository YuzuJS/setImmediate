/*jshint curly: true, eqeqeq: true, newcap: true, noarg: true, white: true, browser: true */

/* setImmediate.js
 *
 * A cross-browser implimentation of setImmediate and clearImmediate:
 * https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
 * It should work full speed in Firefox 3+, Internet Explorer 8+, WebKit (Chrome, Safari) and Opera 9.5+.
 * If the browser does NOT support postMessage, it falls back to the slow (i.e. normal) setTimeout/clearTimeout method.
 * In otherwords, setImmediate and clearImmediate are safe in all browsers.
 *
 * Copyright (c) 2011 Barnesandnoble.com, llc and Donavon West
 * Released under MIT license (see MIT-LICENSE.txt)
 */

(function (global) {
	if (!global.setImmediate) {
		// If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
		var attachTo = typeof Object.getPrototypeOf === "function" && "setTimeout" in Object.getPrototypeOf(global)
						? Object.getPrototypeOf(global)
						: global;

		if (global.msSetImmediate && global.msClearImmediate) {
			// For IE10

			attachTo.setImmediate = global.msSetImmediate;
			attachTo.clearImmediate = global.msClearImmediate;
		} else if (global.MessageChannel) {
			// For super-modern browsers; also works inside web workers.

			var currentHandle = 1; // Handle MUST be non-zero, says the spec.
			var executingHandles = {}; // Used as a "set", i.e. keys are handles and values don't matter.

			attachTo.setImmediate = function (handler/*[, args]*/) {
				var that = this;
				var args = Array.prototype.slice.call(arguments, 1);

				currentHandle++;

				// Create a channel and immediately post a message to it with the current handle.
				var channel = new global.MessageChannel();
				channel.port1.onmessage = function (event) {
					var theHandle = event.data;

					// The message posted includes the handle; make sure that handle hasn't been cleared.
					if (executingHandles.hasOwnProperty(theHandle)) {
						delete executingHandles[theHandle];

						handler.apply(that, args);
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
		} else {
			var handle = 1; // Handle MUST be non-zero, says the spec.
	 	 	var immediates = [];
			function executeTask(task) {
				if (task.handler.apply) {
					task.handler.apply(task.that, task.args);
				} else {
					throw new Error("setImmediate.js: shoot me now! there's no way I'm implementing an evaluated handler!");
				}
			}

			 if (global.postMessage && !global.importScripts) {
				// For modern browsers. The test against importScripts prevents this implementation from being installed 
				// inside a web worker, since some browsers support web workers but not MessageChannel.

			 	var messageName = "com.bn.NobleJS.setImmediate";

			 	function handleMessage(event) {
					if (event.source === global && event.data === messageName) {
						event.stopPropagation();

						if (immediates.length > 0) {
							executeTask(immediates.shift());
						}
					}
				}
				if (global.addEventListener) {
					global.addEventListener("message", handleMessage, false);
				} else {
					global.attachEvent("message", handleMessage);
				}

				attachTo.setImmediate = function (handler/*[, args]*/) {
					var args = Array.prototype.slice.call(arguments, 1);
					var task = { handle: handle, handler: handler, args: args, that: this };
					immediates.push(task);
				
					global.postMessage(messageName, "*");
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
			} else {
				// For older browsers.

				attachTo.setImmediate = function (handler /*[, args]*/) {
					var that = this;
					var args = Array.prototype.slice.call(arguments, 1);

					return setTimeout(function () {
						executeTask({ handler:handler, args: args, that: that });
					}, 0);
				};

				attachTo.clearImmediate = clearTimeout;
			}
		}
	}
}(this));
