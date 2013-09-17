"use strict";
var types = [
require('./src/realSetImmediate'),
require('./src/nextTick'),
require('./src/postMessage'),
require('./src/messageChannel'),
require('./src/stateChange'),
require('./src/timeout')];



types.some(function(obj) {
    var t = obj.test();
    if (t) {
        exports.setImmediate = obj.install();
        exports.clearImmediate = obj.clearImmediate;
    }
    return t;
});