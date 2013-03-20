suite('Array.greedyZipWith');
require('../sinful');


test('transported from the non-greedy version', function(){
    
    var zipped = Array.greedyZipWith(function () {
        return Array.prototype.reduce.call(arguments, function (sum, each) {
            return sum + each;
        });
    }, [1], [2, 2], [3, 3, 3]);

    // Calling `toString` is required because `NaN === NaN` is `false`.
    require('assert').deepEqual(zipped.toString(), [6, NaN, NaN].toString());
});
