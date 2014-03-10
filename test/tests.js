var test = require('tape');
var immediate = require("../lib");

test("Handlers do execute", function (t) {
    immediate(function () {
        t.end();
    });
});

test("Handlers do not execute in the same event loop turn as the call to `setImmediate`", function (t) {
    var handlerCalled = false;
    function handler() {
        handlerCalled = true;
        t.end();
    }

    immediate(handler);
    t.notOk(handlerCalled);
});

test("passes through an argument to the handler", function (t) {
    var expectedArg = { expected: true };

    function handler(actualArg) {
        t.equal(actualArg, expectedArg);
        t.end();
    }

    immediate(handler, expectedArg);
});

test("passes through two arguments to the handler", function (t) {
    var expectedArg1 = { arg1: true };
    var expectedArg2 = { arg2: true };

    function handler(actualArg1, actualArg2) {
        t.equal(actualArg1, expectedArg1);
        t.equal(actualArg2, expectedArg2);
        t.end();
    }

    immediate(handler, expectedArg1, expectedArg2);
});

test("witin the same event loop turn prevents the handler from executing", function (t) {
    var handlerCalled = false;
    function handler() {
        handlerCalled = true;
    }

    var handle = immediate(handler);
    immediate.clear(handle);

    setTimeout(function () {
        t.notOk(handlerCalled);
        t.end();
    }, 100);
});

test("does not interfere with handlers other than the one wtesth ID passed to test", function (t) {
    var expectedArgs = ["A", "D"];
    var recordedArgs = [];
    function handler(arg) {
        recordedArgs.push(arg);
    }

    immediate(handler, "A");
    immediate.clear(immediate(handler, "B"));
    var handle = immediate(handler, "C");
    immediate(handler, "D");
    immediate.clear(handle);

    setTimeout(function () {
        t.deepEqual(recordedArgs, expectedArgs);
        t.end();
    }, 100);
});

test("big test", function (t) {
    //mainly for optimizition testing
    var i = 10;
    function doStuff() {
        i--;
        if(!i) {
            t.end();
        } else {
            immediate(doStuff);
        }
    }
    immediate(doStuff);
});