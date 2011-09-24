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

  var immediates = {},
      MESSAGE_NAME = 'com.bn.NobleJS.setImmediate';

  function clearImmediate(id) {
    var x;
    if (immediates.hasOwnProperty(id)) {
      x = immediates[id];
      if (x.hasOwnProperty('msSetImmediateId') && global.msClearImmediate) {
        global.msClearImmediate(x.msSetImmediateId);
      }
      if (x.port) {
        x.port.onmessage = null;
      }
      if (x.listener) {
        global.removeEventListener('message', x.listener, false);
      }
      clearTimeout(id);
      delete immediates[id];
    }
  }

  if (!global.setImmediate) {
    global.setImmediate = function (callback) {
      var syncronouse = true,
          args = [].slice.call(arguments, 1),
          channel, id;

      function onTimeout() {
        if (!syncronouse) {
          clearImmediate(id);

          callback.apply(global, args);
        }
      }

      id = setTimeout(onTimeout);
      immediates[id] = {};

      if (global.msSetImmediate) {
        immediates[id].msSetImmediateId = global.msSetImmediate(onTimeout);
      }

      if (global.MessageChannel) {
        channel = new global.MessageChannel();
        channel.port1.onmessage = onTimeout;
        channel.port2.postMessage('');
        immediates[id].port = channel.port1;
      }

      // The test against importScripts prevents this implementation from being installed inside a web worker,
      // where postMessage means something completely different and can't be used for this purpose.
      if (global.addEventListener && global.postMessage && !global.importScripts) {
        immediates[id].listener = function (event) {
          if (event.source === global && event.data === MESSAGE_NAME + id) {
            onTimeout();
          }
        };
        global.addEventListener('message', immediates[id].listener, false);
        global.postMessage(MESSAGE_NAME + id, '*');
      }

      syncronouse = false;
      return id;
    };

    global.clearImmediate = clearImmediate;
  }
}(this));
