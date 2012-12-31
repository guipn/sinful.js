suite('Number.prototype.times');

var a = require('assert');

require('../sinful');

test('Number.prototype.times to increment a counter', function(){

    var counter = 0;
    (10).times(function () { counter += 1; });

    a.equal(counter, 10);
});

test('Number.prototype.times to create a range', function(){

    function id(x) { return x; }

    a.deepEqual((5).times(id), [0, 1, 2, 3, 4]);
});
