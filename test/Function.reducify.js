suite('Function.prototype.reducify');

var a = require('assert');

test('Function.prototype.reducify on add', function(){
    
    var add = function(a, b){ return a + b },
        sum = add.reducify();

    a.equal(sum(1, 2, 3, 4), 10);
});
