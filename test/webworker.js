
importScripts('../setImmediate.js?' + Math.random());

function test(func, n, callback) {
  var i = -1,
      t = +new Date();
  function onTimeout() {
    i++;
    if (i < n) {
      func(onTimeout, 0);
    } else {
      callback(+new Date() - t);
    }
  }
  onTimeout();
}

self.onmessage = function () {
  var t = +new Date();
  
  test(setTimeout, 100, function (delay) {
    self.postMessage('delay with setTimeout: ' + delay + ' ms');
    test(setImmediate, 100, function (delay) {
      self.postMessage('delay with setImmediate: ' + delay + ' ms');
    });
  });

};
