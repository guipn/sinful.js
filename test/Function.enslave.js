suite('Function.enslave');

var a = require('assert');

test('on an identity function', function(){
    
    var id = function(val){ return val; }, 
        o  = {
            id: Function.enslave(id)
        };

    a.equal(o, o.id());
});

test('symetry with liberate', function(){
    
    var sum  = function(a, b){ return a + b; }.reducify(),
        sum2 = Function.liberate(Function.enslave(sum)); 

    a.equal(sum(1, 2, 3), sum2(1, 2, 3));
});
