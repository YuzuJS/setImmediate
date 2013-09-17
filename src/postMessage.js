var tasks = require('./tasks');
exports.test = function() {
    // The test against `importScripts` prevents this implementation from being installed inside a web worker,
    // where `global.postMessage` means something completely different and can't be used for this purpose.

    if (!global.postMessage || global.importScripts) {
        return false;
    }

    var postMessageIsAsynchronous = true;
    var oldOnMessage = global.onmessage;
    global.onmessage = function() {
        postMessageIsAsynchronous = false;
    };
    global.postMessage("", "*");
    global.onmessage = oldOnMessage;

    return postMessageIsAsynchronous;
};

exports.install = function() {
    // Installs an event handler on `global` for the `message` event: see
    // * https://developer.mozilla.org/en/DOM/window.postMessage
    // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

    var MESSAGE_PREFIX = "com.bn.NobleJS.setImmediate" + Math.random();

    function isStringAndStartsWith(string, putativeStart) {
        return typeof string === "string" && string.substring(0, putativeStart.length) === putativeStart;
    }

    function onGlobalMessage(event) {
        // This will catch all incoming messages (even from other windows!), so we need to try reasonably hard to
        // avoid letting anyone else trick us into firing off. We test the origin is still this window, and that a
        // (randomly generated) unpredictable identifying prefix is present.
        if (event.source === global && isStringAndStartsWith(event.data, MESSAGE_PREFIX)) {
            var handle = event.data.substring(MESSAGE_PREFIX.length);
            tasks.runIfPresent(handle);
        }
    }
    if (global.addEventListener) {
        global.addEventListener("message", onGlobalMessage, false);
    }
    else {
        global.attachEvent("onmessage", onGlobalMessage);
    }

    return function() {
        var handle = tasks.addFromSetImmediateArguments(arguments);

        // Make `global` post a message to itself with the handle and identifying prefix, thus asynchronously
        // invoking our onGlobalMessage listener above.
        global.postMessage(MESSAGE_PREFIX + handle, "*");

        return handle;
    };
};
exports.clearImmediate = tasks.remove;