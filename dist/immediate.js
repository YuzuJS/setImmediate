!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.immediate=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';
exports.test = function () {
  return false;
};
},{}],2:[function(_dereq_,module,exports){
'use strict';
var types = [
  _dereq_('./nextTick'),
  _dereq_('./mutation'),
  _dereq_('./postMessage'),
  _dereq_('./messageChannel'),
  _dereq_('./stateChange'),
  _dereq_('./timeout')
];
var handlerQueue = [];
function drainQueue() {
  var i = 0,
  task,
  innerQueue = handlerQueue;
  handlerQueue = [];
  while ((task = innerQueue[i++])) {
    task();
  }
}
var nextTick;
var i = -1;
var len = types.length;
while (++ i < len) {
  if (types[i].test()) {
    nextTick = types[i].install(drainQueue);
    break;
  }
}
module.exports = function (task) {
  var len, i, args;
  var nTask = task;
  if (arguments.length > 1 && typeof task === 'function') {
    args = new Array(arguments.length - 1);
    i = 0;
    while (++i < arguments.length) {
      args[i - 1] = arguments[i];
    }
    nTask = function () {
      task.apply(undefined, args);
    };
  }
  if ((len = handlerQueue.push(nTask)) === 1) {
    nextTick(drainQueue);
  }
  return len;
};
module.exports.clear = function (n) {
  if (n <= handlerQueue.length) {
    handlerQueue[n - 1] = function () {};
  }
  return this;
};

},{"./messageChannel":3,"./mutation":4,"./nextTick":1,"./postMessage":5,"./stateChange":6,"./timeout":7}],3:[function(_dereq_,module,exports){
(function (global){
'use strict';

exports.test = function () {
  return typeof global.MessageChannel !== 'undefined';
};

exports.install = function (func) {
  var channel = new global.MessageChannel();
  channel.port1.onmessage = func;
  return function () {
    channel.port2.postMessage(0);
  };
};
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(_dereq_,module,exports){
(function (global){
'use strict';
//based off rsvp https://github.com/tildeio/rsvp.js
//license https://github.com/tildeio/rsvp.js/blob/master/LICENSE
//https://github.com/tildeio/rsvp.js/blob/master/lib/rsvp/asap.js

var Mutation = global.MutationObserver || global.WebKitMutationObserver;

exports.test = function () {
  return Mutation;
};

exports.install = function (handle) {
  var called = 0;
  var observer = new Mutation(handle);
  var element = global.document.createTextNode('');
  observer.observe(element, {
    characterData: true
  });
  return function () {
    element.data = (called = ++called % 2);
  };
};
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(_dereq_,module,exports){
(function (global){
'use strict';
// The test against `importScripts` prevents this implementation from being installed inside a web worker,
// where `global.postMessage` means something completely different and can't be used for this purpose.

exports.test = function () {
  if (!global.postMessage || global.importScripts) {
    return false;
  }

  var postMessageIsAsynchronous = true;
  var oldOnMessage = global.onmessage;
  global.onmessage = function () {
    postMessageIsAsynchronous = false;
  };
  global.postMessage('', '*');
  global.onmessage = oldOnMessage;

  return postMessageIsAsynchronous;
};

exports.install = function (func) {
  var codeWord = 'com.calvinmetcalf.setImmediate' + Math.random();
  function globalMessage(event) {
    if (event.source === global && event.data === codeWord) {
      func();
    }
  }
  if (global.addEventListener) {
    global.addEventListener('message', globalMessage, false);
  } else {
    global.attachEvent('onmessage', globalMessage);
  }
  return function () {
    global.postMessage(codeWord, '*');
  };
};
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(_dereq_,module,exports){
(function (global){
'use strict';

exports.test = function () {
  return 'document' in global && 'onreadystatechange' in global.document.createElement('script');
};

exports.install = function (handle) {
  return function () {

    // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
    // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
    var scriptEl = global.document.createElement('script');
    scriptEl.onreadystatechange = function () {
      handle();

      scriptEl.onreadystatechange = null;
      scriptEl.parentNode.removeChild(scriptEl);
      scriptEl = null;
    };
    global.document.documentElement.appendChild(scriptEl);

    return handle;
  };
};
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(_dereq_,module,exports){
'use strict';
exports.test = function () {
  return true;
};

exports.install = function (t) {
  return function () {
    setTimeout(t, 0);
  };
};
},{}]},{},[2])
(2)
});