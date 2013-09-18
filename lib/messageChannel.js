var global = require('./global');
exports.test = function() {
    return !!global.MessageChannel;
};

exports.install = function(func) {
    var channel = new MessageChannel();
    channel.port1.onmessage = func;
    return function() {
        channel.port2.postMessage(0);
    };
};