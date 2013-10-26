"use strict";
exports.test = function () {
    // Don't get fooled by e.g. browserify environments.
    return typeof process === "object" && !process.browser && Object.prototype.toString.call(process) === "[object process]";
};

exports.install = function () {
    return process.nextTick;
};