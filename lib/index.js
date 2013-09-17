"use strict";
var types = [
require('./realSetImmediate'),
require('./nextTick'),
require('./postMessage'),
require('./messageChannel'),
require('./stateChange'),
require('./timeout')];



types.some(function(obj) {
    var t = obj.test();
    if (t) {
        module.exports = obj.install();
    }
    return t;
});