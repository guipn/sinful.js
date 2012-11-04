suite('Function.enslave');

var a = require('assert');

test('on an identity function', function(){
    
    var id = function(val){ return val; }, 
        o  = {
            id: Function.enslave(id)
        };

    a.equal(o, o.id());
})
