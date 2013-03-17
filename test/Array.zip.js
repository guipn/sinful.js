suite('Array.zip');
require('../sinful');


test('as showcased on the wiki', function(){
    
    var zipped = Array.zip([1, 1, 1, 1], [2, 2, 2], [3, 3, 3, 3, 3, 3, 3]);

    require('assert').deepEqual(zipped, [[1, 2, 3], [1, 2, 3], [1, 2, 3]]);
});
