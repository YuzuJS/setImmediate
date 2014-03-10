"use strict";

exports.test = function () {
    return  global.setImmediate;
};

exports.install = function (handle) {
    return global.setTimeout.bind(global, handle, 0);
};
