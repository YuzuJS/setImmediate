/*jshint curly: true, eqeqeq: true, newcap: true, noarg: true, white: true, browser: true */

/* setImmediate.js
 *
 * An implementation of setImmediate and clearImmediate:
 * https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
 * This version only works in modern browsers: Firefox 4+, Internet Explorer 9+, Chrome, Safari 5+.
 * In particular, we require support for Object.getPrototypeOf, Object.defineProperties, window.postMessage, and window.addEventListener.
 *
 * Released under MIT license (see MIT-LICENSE.txt)
 */

if (!window.setImmediate) {
	(function () {
		var handle = 1; // Handle MUST be non-zero, says the spec.
		var immediates = [];
		var messageName = "com.bn.NobleJS.setImmediate";

		function handleMessage(event) {
			if (event.source === window && event.data === messageName) {
				event.stopPropagation();

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
		window.addEventListener("message", handleMessage, false);

		// Emulate setTimeout/clearTimeout: attach to the prototype of window as writable, enumerable, and non-configurable.
		Object.defineProperties(Object.getPrototypeOf(window), {
			setImmediate: {
				writable: true,
				enumerable: true,
				value: function (handler/*, args */) {
					var args = Array.prototype.slice.call(arguments, 1);
					var task = { handle: handle, handler: handler, args: args, that: this };

					immediates.push(task);
					window.postMessage(messageName, "*");

					return handle++;
				}
			},
			clearImmediate: {
				writable: true,
				enumerable: true,
				value: function (handle) {
					for (var i = 0; i < immediates.length; i++) {
						if (immediates[i].handle === handle) {
							immediates.splice(i, 1); //remove the task
							break;
						}
					}
				}
			}
		});
	}());
}
