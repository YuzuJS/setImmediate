var tasks = require('./tasks');
exports.test = function() {
    return !!global.MessageChannel;
};

exports.install = function(attachTo) {
    var channel = new global.MessageChannel();
    channel.port1.onmessage = function(event) {
        var handle = event.data;
        tasks.runIfPresent(handle);
    };
    return function() {
        var handle = tasks.addFromSetImmediateArguments(arguments);

        channel.port2.postMessage(handle);

        return handle;
    };
};
exports.clearImmediate = tasks.remove;