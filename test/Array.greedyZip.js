suite('Array.greedyZip');
require('../sinful');


test('transported from the non-greedy version', function(){
    
    var zipped   = Array.greedyZip([1], [2, 2], [3, 3, 3]),
        expected = [[1, 2, 3], [undefined, 2, 3], [undefined, undefined, 3]];

    require('assert').deepEqual(zipped, expected);
});
