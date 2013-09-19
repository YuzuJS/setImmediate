"use strict";
var globe = require("./global");
exports.test = function () {
    return globe.setImmediate;
};

exports.install = function () {
    return globe.setImmediate.bind(globe);
};