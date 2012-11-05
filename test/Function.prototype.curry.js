suite('Function.prototype.curry');
require('../sinful');

var a = require('assert');


test('Function.prototype.curry with no args', function(){

    var add = function (a, b) { return a + b }.curry();

    a.equal(add(1, 2), 3);
    a.equal(add()()()(1)(2), 3);

    var add1= add(1),
        add2= add(2);

    a.equal(add1(1), 2);
    a.equal(add2(1), 3);

});

test('Function.prototype.curry with a depth arg', function(){

    var sum = function () {
        
            var nums = [].slice.call(arguments);
            
            return nums.reduce(function (a, b) { return a + b }, 0);

        },
        sum5 = sum.curry(5);

        a.equal(sum5(1, 2)(3, 4)(5), 15);
})

test('Function.prototype.curry with too many args', function(){

    var f = function(){};

    a.throws(function(){ f.curry(1, 2, 3) });

})
