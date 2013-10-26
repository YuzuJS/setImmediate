 mocha.setup({
        ui: "bdd"
    });
var assert = chai.assert;
describe('imediate',function(){


it("Handlers do execute", function (done) {
    immediate(function () {
        done();
    });
});

it("Handlers do not execute in the same event loop turn as the call to `setImmediate`", function (done) {
    var handlerCalled = false;
    function handler() {
        handlerCalled = true;
        done();
    }

    immediate(handler);
    assert(!handlerCalled);
});

it(" passes through an argument to the handler", function (done) {
    var expectedArg = { expected: true };

    function handler(actualArg) {
        assert.strictEqual(actualArg, expectedArg);
        done();
    }

    immediate(handler, expectedArg);
});

it(" passes through two arguments to the handler", function (done) {
    var expectedArg1 = { arg1: true };
    var expectedArg2 = { arg2: true };

    function handler(actualArg1, actualArg2) {
        assert.strictEqual(actualArg1, expectedArg1);
        assert.strictEqual(actualArg2, expectedArg2);
        done();
    }

    immediate(handler, expectedArg1, expectedArg2);
});
});
describe('clear',function(){
it(" within the same event loop turn prevents the handler from executing", function (done) {
    var handlerCalled = false;
    function handler() {
        handlerCalled = true;
    }

    var handle = immediate(handler);
    immediate.clear(handle);

    setTimeout(function () {
        assert(!handlerCalled);
        done();
    }, 100);
});

it(" does not interfere with handlers other than the one with ID passed to it", function (done) {
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
        assert.deepEqual(recordedArgs, expectedArgs);
        done();
    }, 100);
});
});