exports.test = function(){
    return typeof setImmediate !== 'undefined';
};

exports.install = function(){
    return setImmediate;
};
exports.clearImmediate = clearImmediate;