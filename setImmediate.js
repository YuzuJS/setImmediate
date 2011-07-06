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

if (!window.setImmediate) {

  // If supported, we should attach to the prototype of window, since that is where setTimeout et al. live.
	var attachTo = typeof Object.getPrototypeOf === "function" ? Object.getPrototypeOf(window) : window;

	if (window.postMessage) { // For modern browsers.

		(function () {
			var handle = 1; // Handle MUST be non-zero, says the spec.
			var immediates = [];
			var messageName = "com.bn.NobleJS.setImmediate";

			function handleMessage(event) {
				if (event.source === window && event.data === messageName) {
					if (event.stopPropagation) { //TODO: needed?
						event.stopPropagation();
					}
					if (immediates.length) {
						var task = immediates.shift();
						if (task.handler.apply) {
							task.handler.apply(task.that, task.args);
						} else {
							throw new Error("setImmediate.js: shoot me now! there's no way I'm implementing an evaluated handler!");
						}
					}
				}
			}
			if (window.addEventListener) {
				window.addEventListener("message", handleMessage, false);
			} else {
				window.attachEvent("message", handleMessage);
			}
			
			attachTo.setImmediate = function (/*handler[, args]*/) {
				var handler = arguments[0];
				var args = [].slice.call(arguments, 1);
				var task = { handle: handle, handler: handler, args: args, that: this };
				immediates.push(task);
				window.postMessage(messageName, "*");
				return handle++;
			};

			attachTo.clearImmediate = function (handle) {
				for (var i = 0; i < immediates.length; i++) {
					if (immediates[i].handle === handle) {
						immediates.splice(i, 1); //remove the task
						break;
					}
				}
			};
		}());

	} else { // Fallback to legacy support for non-postMessage browsers.

		window.setImmediate = function (/*handler[, args]*/) {
			var that = this;
			var handler = arguments[0];
			var args = [].slice.call(arguments, 1);
			return setTimeout(function () {
				if (handler.apply) {
					handler.apply(that, args);
				} else {
					throw ("setImmediate.js: shoot me now! there's no way I'm implimenting an evaluated handler");
				}
			}, 0);
		};

		window.clearImmediate = clearTimeout;

	}
}
