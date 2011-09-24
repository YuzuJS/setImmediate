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

  var immediates = [],
      syncronouse = false,
      executed = false,
      MESSAGE_NAME = 'com.bn.NobleJS.setImmediate';

  function clearImmediate(id) {
    var i, x = [];
    for (i = 0; i < immediates.length; i++) {
      if (immediates[i].id !== id) {
        x.push(immediates[i]);
      }
    }
    immediates = x;
  }

  function onTimeout() {
    if (!syncronouse && immediates.length) {
      if (!executed) {
        executed = true;
        var x = immediates.shift();
        try {
          x.callback.apply(global, x.args);
        } catch (e) {
          executed = false;
          throw e;
        }
        executed = false;
      } else {
        setTimeout(onTimeout, 0);
      }
    }
  }

  if (global.addEventListener && global.postMessage && !global.importScripts) {
    global.addEventListener('message', function (event) {
      if (event.source === global && event.data === MESSAGE_NAME) {
        onTimeout();
      }
    }, false);
  }

  if (!global.setImmediate) {
    global.setImmediate = function (callback) {
      var x = {
        args: [].slice.call(arguments, 1),
        callback: callback
      }, channel;

      syncronouse = true;
      immediates.push(x);

      x.id = setTimeout(onTimeout, 0);
      if (global.msSetImmediate) {
        global.msSetImmediate(onTimeout);
      } else if (global.MessageChannel) {
        channel = new global.MessageChannel();
        channel.port1.onmessage = onTimeout;
        channel.port2.postMessage('');
      } else if (global.addEventListener && global.postMessage && !global.importScripts) {
        global.postMessage(MESSAGE_NAME, '*');
      }

      syncronouse = false;
      return x.id;
    };

    global.clearImmediate = clearImmediate;
  }
}(this));
