"use strict";
exports.test = function () {
    // Don't get fooled by e.g. browserify environments.
    return process && !process.browser;
};

exports.install = function () {
    return global.setImmediate || process.nextTick;
};