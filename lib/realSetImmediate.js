var global = require('./global');
exports.test = function(){
    return global.setImmediate;
};

exports.install = function() {
     return setImmediate.bind(global);
};