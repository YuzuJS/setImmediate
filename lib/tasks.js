function Task(handler, args) {
    this.handler = handler;
    this.args = args;
}
Task.prototype.run = function() {
    // See steps in section 5 of the spec.
    if (typeof this.handler === "function") {
        // Choice of `thisArg` is not in the setImmediate spec; `undefined` is in the setTimeout spec though:
        // http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html
        this.handler.apply(undefined, this.args);
    }
    else {
        var scriptSource = "" + this.handler;
        /*jshint evil: true */
        eval(scriptSource);
    }
};

var nextHandle = 1; // Spec says greater than zero
var tasksByHandle = {};
var currentlyRunningATask = false;

exports.addFromSetImmediateArguments = function(args) {
    var handler = args[0];
    var argsToHandle = Array.prototype.slice.call(args, 1);
    var task = new Task(handler, argsToHandle);

    var thisHandle = nextHandle++;
    tasksByHandle[thisHandle] = task;
    return thisHandle;
};
exports.runIfPresent = function(handle) {
    // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
    // So if we're currently running a task, we'll need to delay this invocation.
    if (!currentlyRunningATask) {
        var task = tasksByHandle[handle];
        if (task) {
            currentlyRunningATask = true;
            try {
                task.run();
            }
            finally {
                delete tasksByHandle[handle];
                currentlyRunningATask = false;
            }
        }
    }
    else {
        // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
        // "too much recursion" error.
        setTimeout(function() {
            exports.runIfPresent(handle);
        }, 0);
    }
};
exports.remove = function(handle) {
    delete tasksByHandle[handle];
};