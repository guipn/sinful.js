suite('Function.prototype.liberate');

var a = require('assert');

test('Function.prototype.liberate on [].slice', function(){
    
    var slice = Function.liberate([].slice);

    a.equal(slice([1, 2], 1)[0], 2);

})
