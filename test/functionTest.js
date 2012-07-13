suite('function tests');

var a = require('assert');

require('../sinful');

test('Function.prototype.curry', function(){

    var add = function(a, b){ return a + b }.curry()

    a.equal(add(1, 2), 3);
    a.equal(add()()()(1)(2), 3);

    var add1= add(1)
      , add2= add(2);

    a.equal(add1(1), 2);
    a.equal(add2(1), 3);

});
