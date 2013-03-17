suite('Array.zipWith');
require('../sinful');


test('as showcased on the wiki', function(){
    
    var zipped = Array.zipWith(function () {
        return Array.prototype.reduce.call(arguments, function (sum, each) {
            return sum + each;
        });
    }, [1, 1, 1, 1], [2, 2, 2], [3, 3, 3, 3, 3, 3, 3]);

    require('assert').deepEqual(zipped, [6, 6, 6]);
});
