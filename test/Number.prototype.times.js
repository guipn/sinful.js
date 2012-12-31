suite('Number.prototype.times');

var a = require('assert');

require('../sinful');

test('Number.prototype.times to increment a counter', function(){

    var counter = 0;
    (10).times(function () { counter += 1; });

    a.equal(counter, 10);
});
