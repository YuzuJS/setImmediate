var tasks = require('./tasks');

exports.test = function() {
    return true;
};

exports.install = function(attachTo) {
    return function() {
        var handle = tasks.addFromSetImmediateArguments(arguments);

        global.setTimeout(function() {
            tasks.runIfPresent(handle);
        }, 0);

        return handle;
    };
};
exports.clearImmediate = tasks.remove;