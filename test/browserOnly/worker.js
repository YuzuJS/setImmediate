importScripts("../../dist/setImmediate.js");

setImmediate(function () {
	self.postMessage("TEST");
});
