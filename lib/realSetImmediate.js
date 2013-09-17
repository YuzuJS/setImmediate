exports.test = function(){
    return typeof setImmediate !== 'undefined';
};

exports.install = function() {
     setImmediate.clear = clearImmediate;
     return setImmediate;
};