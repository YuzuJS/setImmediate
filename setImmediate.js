(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;

    function addFromSetImmediateArguments(args) {
        var handler = args[0];
        args[0] = undefined;
        tasksByHandle[nextHandle] = handler.bind.apply(handler, args);
        return nextHandle++;
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            global.setTimeout(runIfPresent.bind(undefined, handle), 0);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function canUseMessageChannel() {
        return !!global.MessageChannel;
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function canUseReadyStateChange() {
        return "document" in global && "onreadystatechange" in global.document.createElement("script");
    }

    function installMessageChannelImplementation(attachTo) {
        var channel = new global.MessageChannel();
        channel.port1.onmessage = function (event) {
            var handle = event.data;
            runIfPresent(handle);
        };
        attachTo.setImmediate = function () {
            var handle = addFromSetImmediateArguments(arguments);

            channel.port2.postMessage(handle);

            return handle;
        };
    }

    function installReadyStateChangeImplementation(attachTo) {
        attachTo.setImmediate = function () {
            var handle = addFromSetImmediateArguments(arguments);

            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var scriptEl = global.document.createElement("script");
            scriptEl.onreadystatechange = function () {
                runIfPresent(handle);

                scriptEl.onreadystatechange = null;
                scriptEl.parentNode.removeChild(scriptEl);
                scriptEl = null;
            };
            global.document.documentElement.appendChild(scriptEl);

            return handle;
        };
    }

    function installSetTimeoutImplementation(attachTo) {
        attachTo.setImmediate = function () {
            var handle = addFromSetImmediateArguments(arguments);

            global.setTimeout(function () {
                runIfPresent(handle);
            }, 0);

            return handle;
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var getProto = Object.getPrototypeOf;
    var attachTo = getProto && getProto(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if (Object.prototype.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        attachTo.setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            process.nextTick(runIfPresent.bind(undefined, handle));
            return handle;
        };

    } else if (canUsePostMessage()) {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var loc = global.location;
        var origin = loc && loc.hostname || "*";
        var messagePrefix = "setImmediate$" + Math.random() + "$";

        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        // For non-IE10 modern browsers
        attachTo.setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            global.postMessage(messagePrefix + handle, origin);
            return handle;
        };

    } else if (canUseMessageChannel()) {
        // For web workers, where supported
        installMessageChannelImplementation(attachTo);
    } else if (canUseReadyStateChange()) {
        // For IE 6–8
        installReadyStateChangeImplementation(attachTo);
    } else {
        // For older browsers
        installSetTimeoutImplementation(attachTo);
    }

    attachTo.clearImmediate = clearImmediate;
}(typeof global === "object" && global ? global : this));
