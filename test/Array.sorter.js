suite('Array.sorter');
require('../sinful');


test('as showcased on the wiki', function(){
    
    var arr = [
        {f1: 1, f2: {f3: 3} },
        {f1: 1, f2: {f3: 4} },
        {f1: -1, f2: {f3: 2} }
    ];
    var multiSorter = Array.sorter(['f1'],['f2.f3',-1]); // field f1 asc, field f2.f3 desc

    require('assert').deepEqual(arr.sort(multiSorter), [{f1: -1, f2: {f3: 2} },{f1: 1, f2: {f3: 4} },{f1: 1, f2: {f3: 3}}]);
});
