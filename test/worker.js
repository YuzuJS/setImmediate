importScripts('../dist/immediate.');
self.onmessage(function (e) {
  if (e.data === 'ping') {
    immediate(function () {
      self.postmessage('pong');
    });
  }
});