var tasks = require('./tasks');
exports.test = function() {
    // Don't get fooled by e.g. browserify environments.
    return typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";
};

exports.install = function(attachTo) {
    return function() {
        var handle = tasks.addFromSetImmediateArguments(arguments);

        process.nextTick(function() {
            tasks.runIfPresent(handle);
        });

        return handle;
    };
};
exports.clearImmediate = tasks.remove;