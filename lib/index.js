"use strict";
var types = [
    require("./realSetImmediate"),
    require("./nextTick"),
    require("./postMessage"),
    require("./messageChannel"),
    require("./stateChange"),
    require("./timeout")
];
var handlerQueue = [];

function drainQueue() {
    var i = 0,
        task;
    /*jslint boss: true */
    while (task = handlerQueue[i++]) {
        task();
    }

    handlerQueue = [];
}
var nextTick;
types.some(function (obj) {
    var t = obj.test();
    if (t) {
        nextTick = obj.install(drainQueue);
    }
    return t;
});
var retFunc = function (task) {
    var len, args;
    if (arguments.length > 1 && typeof task === "function") {
        args = Array.prototype.slice.call(arguments, 1);
        args.unshift(undefined);
        task = task.bind.apply(task, args);
    }
    if ((len = handlerQueue.push(task)) === 1) {
        nextTick(drainQueue);
    }
    return len;
};
retFunc.clear = function (n) {
    if (n <= handlerQueue.length) {
        handlerQueue[n - 1] = function () {};
    }
    return this;
};
module.exports = retFunc;