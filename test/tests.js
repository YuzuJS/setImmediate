"use strict";
/*global setImmediate: false, clearImmediate: false, specify: false, window: false */

var assert = require("assert");
require("../setImmediate");

specify("Handlers do execute", function (done) {
    setImmediate(function () {
        done();
    });
});

specify("Handlers do not execute in the same event loop turn as the call to `setImmediate`", function (done) {
    var handlerCalled = false;
    function handler() {
        handlerCalled = true;
        done();
    }

    setImmediate(handler);
    assert(!handlerCalled);
});

specify("`setImmediate` passes through an argument to the handler", function (done) {
    var expectedArg = { expected: true };

    function handler(actualArg) {
        assert.strictEqual(actualArg, expectedArg);
        done();
    }

    setImmediate(handler, expectedArg);
});

specify("`setImmediate` passes through two arguments to the handler", function (done) {
    var expectedArg1 = { arg1: true };
    var expectedArg2 = { arg2: true };

    function handler(actualArg1, actualArg2) {
        assert.strictEqual(actualArg1, expectedArg1);
        assert.strictEqual(actualArg2, expectedArg2);
        done();
    }

    setImmediate(handler, expectedArg1, expectedArg2);
});

specify("`clearImmediate` within the same event loop turn prevents the handler from executing", function (done) {
    var handlerCalled = false;
    function handler() {
        handlerCalled = true;
    }

    var handle = setImmediate(handler);
    clearImmediate(handle);

    setTimeout(function () {
        assert(!handlerCalled);
        done();
    }, 100);
});

specify("`clearImmediate` does not interfere with handlers other than the one with ID passed to it", function (done) {
    var expectedArgs = ["A", "D"];
    var recordedArgs = [];
    function handler(arg) {
        recordedArgs.push(arg);
    }

    setImmediate(handler, "A");
    clearImmediate(setImmediate(handler, "B"));
    var handle = setImmediate(handler, "C");
    setImmediate(handler, "D");
    clearImmediate(handle);

    setTimeout(function () {
        assert.deepEqual(recordedArgs, expectedArgs);
        done();
    }, 100);
});

if (typeof window !== "undefined") {
    specify.skip("Modal dialogs block handlers", function (done) {
        // Try to launch the less-annoying self-closing-window modal dialog; if that's not an option, fall back to alert.
        var showTheDialog = window.showModalDialog ?
            function () {
                window.showModalDialog("selfClose.htm");
            }
            : function () {
                window.alert("Please press OK to continue the test; we needed a modal dialog.");
            };

        var dialogClosed = false;
        setImmediate(function () {
            showTheDialog();
            dialogClosed = true;
        });

        setImmediate(function () {
            assert(dialogClosed);
            done();
        });
    });
}

if (typeof window !== "undefined" && typeof window.Worker === "function") {
    specify.skip("When inside a web worker context, setImmediate calls the passed handler", function (done) {
        var worker = new window.Worker("worker.js");
        worker.addEventListener("message", function (event) {
            assert.strictEqual(event.data, "TEST");
            done();
        }, false);
    });
}
