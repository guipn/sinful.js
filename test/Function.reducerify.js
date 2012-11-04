suite('Function.prototype.reducify');

var a = require('assert');

require('../sinful');

test('Function.prototype.reducerify on add', function(){
    
    var add = function(a, b){ return a + b },
        sum = add.reducerify();

    a.equal(sum(1, 2, 3, 4), 10);
});

test('Function.prototype.reducerify on add with initial value', function(){
    
    var add = function(a, b){ return a + b },
        sum = add.reducerify(0);

    a.equal(sum(1, 2, 3, 4), 10);
    a.equal(sum(), 0);
});
