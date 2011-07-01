/*jslint browser: true, unparam: false, sloppy: true, es5: false, vars: false, evil: true, plusplus: true, maxerr: 50, indent: 4 */

/* setImmediate.js
 *
 * A cross-browser(ish) implimentation of setImmediate and clearImmediate
 * It should work full speed in Firefox 3+, Internet Explorer 8+, WebKit (Chrome, Safari) and Opera 9.5+
 * If the browser does NOT support postMessage, it falls back to the slow(i.e. normal) setTimeout/clearTimeout method
 * In otherwords, setImmediate and clearImmediate is safe in all browsers.
 *
 * 2011-06-30
 * by Barnes and Noble, LLC and Donavon West
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 * see spec at https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
 */

if (!window.setImmediate) {

	if (window.postMessage) { //for modern browsers

		(function () {
			var handle = 1, //handle MUST be non-zero
				immediates = [],
				sendMessage, //
				messageName = "com.bn.NobleJS.setImmediate";

			function handleMessage(event) {
				if (event.source === window && event.data === messageName) {
					if (event.stopPropagation) {
						event.stopPropagation(); //TODO: cross browser?
					}
					if (immediates.length) {
						var task = immediates.shift();
						if (task.handler.apply) {
							task.handler.apply(task.that, task.args);
						} else {
							throw ("setImmediate.js: shoot me now! there's no way I'm implimenting an evaluated handler");
						}
					}
				}
			}
			if (window.addEventListener) {
				window.addEventListener("message", handleMessage);
			} else {
				window.attachEvent("message", handleMessage);
			}

			window.setImmediate = function (/*handler[, args]*/) {
				var handler = arguments[0];
				var args = [].slice.call(arguments, 1);
				var task = {handle: handle, handler: handler, args: args, that:this};
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

	} else { //fallback to legacy support for non postMessage browsers

		window.setImmediate = function (/*handler[, args]*/) {
			var that = this;
			var handler = arguments[0];
			var args = [].slice.call(arguments, 1);
			return setTimeout(function() {
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
