suite('Function.prototype.reducify');

var a = require('assert');

require('../sinful');

test('Function.prototype.reducify on add', function(){
    
    var add = function(a, b){ return a + b },
        sum = add.reducify();

    a.equal(sum(1, 2, 3, 4), 10);
});

test('Function.prototype.reducify on add with initial value', function(){
    
    var add = function(a, b){ return a + b },
        sum = add.reducify(0);

    a.equal(sum(1, 2, 3, 4), 10);
    a.equal(sum(), 0);
});
