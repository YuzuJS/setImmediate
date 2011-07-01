/*jshint curly: true, eqeqeq: true, newcap: true, noarg: true, white: true, browser: true */

/* setImmediate.js
 *
 * A cross-browser(ish) implimentation of setImmediate and clearImmediate:
 * https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
 * It should work full speed in Firefox 3+, Internet Explorer 8+, WebKit (Chrome, Safari) and Opera 9.5+.
 * If the browser does NOT support postMessage, it falls back to the slow (i.e. normal) setTimeout/clearTimeout method.
 * In otherwords, setImmediate and clearImmediate is safe in all browsers.
 *
 * by Barnes and Noble, LLC and Donavon West
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

if (!window.setImmediate) {

	if (window.postMessage) { // For modern browsers.

		(function () {
			var handle = 1; // Handle MUST be non-zero, says the spec.
			var immediates = [];
			var messageName = "com.bn.NobleJS.setImmediate";

			function handleMessage(event) {
				if (event.source === window && event.data === messageName) {
					if (event.stopPropagation) {
						event.stopPropagation(); // TODO: is this cross browser?
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

			window.setImmediate = function (/*handler[, args]*/) {
				var handler = arguments[0];
				var args = [].slice.call(arguments, 1);
				var task = { handle: handle, handler: handler, args: args, that: this };
				immediates.push(task);
				window.postMessage(messageName, "*");
				return handle++;
			};

			window.clearImmediate = function (handle) {
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
