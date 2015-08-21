// sinful.js
// ----------
//
// For the rationale and documentation,
// refer to http://github.com/guipn/sinful.js
//
///////////////////////////////////////////////


void function (bless) {

    'use strict';

    var own      = Object.getOwnPropertyNames,
        bind     = Function.prototype.bind,
        liberate = bind.bind(Function.prototype.call),
        reduce   = liberate(Array.prototype.reduce),
        slice    = liberate(Array.prototype.slice);


    bless = bless || function (thing, name, content) {
        
        if (typeof thing[name] !== 'undefined') {
            throw new Error('Sinful: ' + name + ' is already defined.');
        }

        thing[name] = content;
    };


    // Fixing Floating-point math
    
    // Computes the multiplier necessary to make x >= 1,
    // effectively eliminating miscalculations caused by
    // finite precision.

    function multiplier(x) {

        var parts = x.toString().split('.');

        if (parts.length < 2) {
            return 1;
        }

        return Math.pow(10, parts[1].length);
    }


    // Given a variable number of arguments, returns the maximum
    // multiplier that must be used to normalize an operation involving
    // all of them.

    function correctionFactor() {

        return reduce(arguments, function (prev, next) {

            var mp = multiplier(prev),
                mn = multiplier(next);

        return mp > mn ? mp : mn;

        }, -Infinity);

    }


    // Begin augmenting

    [
        // Efficient String interpolation / templating
        // https://github.com/foo123/sinful.js
        [String, 'template', function (tpl, re_keys) {
            // default key format is $(key)
            if ( 2 > arguments.length ) re_keys = /\$\(([^()]*)\)/g;
            re_keys = re_keys.global ? re_keys : new RegExp(re_keys.source, re_keys.ignoreCase?"gi":"g"); /* make sure global flag is added */
            var a = [ ], i = 0, m, stpl;
            while ( m = re_keys.exec( tpl ) )
            {
                a.push([1, tpl.slice(i, re_keys.lastIndex - m[0].length)]);
                a.push([0, m[1] ? m[1] : m[0]]);
                i = re_keys.lastIndex;
            }
            a.push([1, tpl.slice(i)]);
            stpl = new String(tpl);
            stpl.tpl = a;
            return stpl;
        }],

        // Efficient String interpolation / templating
        // https://github.com/foo123/sinful.js
        [String.prototype, 'render', function (args) {
            var str = this, tpl = str.tpl, l, 
                argslen, i, notIsSub, s, out
            ;
            if ( tpl )
            {
                argslen = args.length;
                out = '';
                for (i=0,l=tpl.length; i<l; i++)
                {
                    notIsSub = tpl[ i ][ 0 ]; s = tpl[ i ][ 1 ];
                    out += (notIsSub ? s : (!s.substr && s < 0 ? args[ argslen+s ] : args[ s ]));
                }
            }
            else
            {
                out = str;
            }
            return out;
        }],

        // String interpolation function proposed in Crockford's The Good Parts 

        [String.prototype, 'interp', function (expansions) {

            var that = this;
            own(expansions).forEach(function (key) {
                that = that.replace(new RegExp('\{' + key + '\}', 'g'), expansions[key]);
            });

            return that;
        }],

        [String.prototype, 'reverse', function () {
            return this.split('').reverse().join('');
        }],

        [String.prototype, 'repeat', function (times, sep) {

            sep = sep || '';
        
            return times > 0 ?
                    new Array(times + 1).join(this + sep) :
                    '';
        }],

        [String.prototype, 'truncate', function (maxLen, suffix) {

            maxLen = maxLen || 50;
            suffix = suffix || '...';

            if (maxLen - suffix.length < 0) {
                throw new Error('The suffix "' + suffix + '" is wider than ' + maxLen);
            }

            return this.length > maxLen ?
                    this.slice(0, maxLen - suffix.length) + suffix :
                    this;
        }],



        [Object.prototype, 'intercept', function (func) {
            func(this);
            return this;
        }],

        [Object.prototype, 'maybe', function (propertyPath, otherwise) {

            return (Array.isArray(propertyPath) ? 
                        propertyPath :
                        propertyPath.split(/\./)).reduce(function (current, next) {
                
                return typeof current[next] === 'undefined' ? 
                                otherwise :
                                current[next];
            }, this);
        }],

        [Object.prototype, 'mapOwn', function (fun, thisArg) {
            return own(this).map(fun, thisArg);
        }],

        [Object.prototype, 'forEachOwn', function (fun, thisArg) {
            return own(this).forEach(fun, thisArg);
        }],

        [Object.prototype, 'deepCopy', (function () {

            var funcBlacklist   = ['caller', 'arguments', 'prototype' ],
                primitiveCloner = makeCloner(clonePrimitive),
                cloneFunctions  = {
                    '[object Null]':      primitiveCloner,
                    '[object Undefined]': primitiveCloner,
                    '[object Number]':    primitiveCloner,
                    '[object String]':    primitiveCloner,
                    '[object Boolean]':   primitiveCloner,
                    '[object RegExp]':    makeCloner(cloneRegExp),
                    '[object Date]':      makeCloner(cloneDate),
                    '[object Function]':  makeRecCloner(makeCloner(cloneFunction), funcBlacklist),
                    '[object Object]':    makeRecCloner(makeCloner(cloneObject)),
                    '[object Array]':     makeRecCloner(makeCloner(cloneArray))
                };

            function clonePrimitive(primitive) {
                return primitive;
            }

            function cloneRegExp(regexp) {
                return RegExp(regexp);
            }

            function cloneDate(date) {
                return new Date(date.getTime());
            }

            function cloneFunction(fn) {

                var copy = Function('return ' + fn.toString() + ';')();

                copy.prototype = Object.getPrototypeOf(fn);

                return copy;
            }

            // This will not properly clone `constructed` objects
            // because it is impossible to know with what arguments the constructor
            // was originally invoked.
            function cloneObject(object) {
                return Object.create(Object.getPrototypeOf(object));
            }

            function cloneArray(array) {
                return [];
            }

            function makeCloner(cloneThing) {

                return function (thing, thingStack, copyStack) {

                    var copy = cloneThing(thing);

                    thingStack.push(thing);
                    copyStack.push(copy);

                    return copy;
                };
            }

            function makeRecCloner(cloneThing, blacklist) {

                return function (thing, thingStack, copyStack) {

                    var clone = this;

                    return own(thing).
                        filter(function (prop) { 
                            return !blacklist || blacklist.indexOf(prop) === -1;
                        }).
                        reduce(function (copy, prop) {

                            var thingOffset = thingStack.indexOf(thing[prop]);

                            copy[prop] = (thingOffset === -1) ?
                                            clone(thing[prop]) :
                                            copyStack[thingOffset];

                            return copy;

                        }, cloneThing(thing, thingStack, copyStack));
                };
            }

            return function () {

                var thingStack = [],
                    copyStack  = [];

                function clone(thing){
                    
                    var type = Object.prototype.toString.call(thing);

                    return cloneFunctions[type].call(clone, thing, thingStack, copyStack);
                }

                return clone(this);
            };
        })()],



        [Function.prototype, 'curry', function (depth) { 

            var curry;

            if (arguments.length > 1) {
                 throw new Error('One parameter expected, ' + arguments.length + ' received.');
            }

            if (typeof depth !== 'undefined' && depth < 1) {
                 throw new Error('Invalid depth received (' + depth + ').');
            }

            curry = function (arity) {

                var that = this,
                    args = slice(arguments, 1);
                
                return function () {

                    var allArgs = args.concat(slice(arguments));

                    return allArgs.length >= arity ? 
                        that.apply(this, allArgs) :
                        curry.apply(that, [arity].concat(allArgs));

                };

            };

            return curry.call(this, depth || this.length);
        }],

        [Function.prototype, 'compose', function (other) {

            var chain = [ this ].concat(slice(arguments));

            return function () { 

                return chain.reduceRight(function (prev, curr) {

                    return [ curr.apply(null, prev) ];

                }, slice(arguments)).pop();
                
            };
        }],

        [Function.prototype, 'iterate', function (last) {
            
            var that = this;

            return function () {
                return last = that(last);
            };
        }],

        [Function.prototype, 'then', function(func) {

            var that = this;

            return function() {
                return func(that.apply(null, arguments));
            };
        }],
        
        [Function.prototype, 'reducerify', function (initialValue) {

            var fn = this;

            return arguments.length ?
                function () {
                    return slice(arguments).reduce(fn, initialValue);
                } :
                function () { 
                    return slice(arguments).reduce(fn);
                };
        }],

        [Function, 'memoize', function (func, keyGen) {

            var cache = {};

            keyGen = keyGen || function (args) {
                return JSON.stringify(args);
            };

            return function () {

                var args = slice(arguments), 
                    key  = keyGen(args);

                return (typeof cache[key] === 'undefined') ? 
                    cache[key] = func.apply(null, args) :
                    cache[key];
            };
        }],

        [Function, 'liberate', liberate],

        [Function, 'enslave', function (fn) {
            
            return function(){
                return fn.bind(null, this).apply(null, arguments);
            };
        
        }],

        [Function, 'bundle', function () {

            var funcs = slice(arguments);

            return function () {
                var args = arguments;

                return funcs.map(function (func) {
                    return func.apply(this, args)
                }.bind(this));
            };

        }],



        // Array multi - sorter utility
        // returns a sorter that can (sub-)sort by multiple (nested) fields 
        // each ascending or descending independantly
        // https://github.com/foo123/sinful.js
        [Array, 'sorter', function () {

            var arr = this, i, args = arguments, l = args.length,
                a, b, step, lt, gt,
                field, filter_args, sorter_args, desc, dir, sorter,
                ASC = '|^', DESC = '|v';
            // |^ after a (nested) field indicates ascending sorting (default), 
            // example "a.b.c|^"
            // |v after a (nested) field indicates descending sorting, 
            // example "b.c.d|v"
            if ( l )
            {
                step = 1;
                sorter = [];
                sorter_args = [];
                filter_args = []; 
                for (i=l-1; i>=0; i--)
                {
                    field = args[i];
                    // if is array, it contains a filter function as well
                    filter_args.unshift('f'+i);
                    if ( field.push )
                    {
                        sorter_args.unshift(field[1]);
                        field = field[0];
                    }
                    else
                    {
                        sorter_args.unshift(null);
                    }
                    dir = field.slice(-2);
                    if ( DESC === dir ) 
                    {
                        desc = true;
                        field = field.slice(0,-2);
                    }
                    else if ( ASC === dir )
                    {
                        desc = false;
                        field = field.slice(0,-2);
                    }
                    else
                    {
                        // default ASC
                        desc = false;
                    }
                    field = field.length ? '["' + field.split('.').join('"]["') + '"]' : '';
                    a = "a"+field; b = "b"+field;
                    if ( sorter_args[0] ) 
                    {
                        a = filter_args[0] + '(' + a + ')';
                        b = filter_args[0] + '(' + b + ')';
                    }
                    lt = desc ?(''+step):('-'+step); gt = desc ?('-'+step):(''+step);
                    sorter.unshift("("+a+" < "+b+" ? "+lt+" : ("+a+" > "+b+" ? "+gt+" : 0))");
                    step <<= 1;
                }
                // use optional custom filters as well
                return (new Function(
                        filter_args.join(','), 
                        'return function(a,b) { return ('+sorter.join(' + ')+'); };'
                        ))
                        .apply(null, sorter_args);
            }
            else
            {
                a = "a"; b = "b"; lt = '-1'; gt = '1';
                sorter = ""+a+" < "+b+" ? "+lt+" : ("+a+" > "+b+" ? "+gt+" : 0)";
                return new Function("a,b", 'return ('+sorter+');');
            }
        }],

        // Array UNION of 2 arrays
        // returns array with unique values of both arrays
        // https://github.com/foo123/sinful.js
        [Array, 'union', function (a, b) {
            
            var ai = 0, bi = 0, union = [ ], last,
                al = a.length, bl = b.length;
            // assume a, b lists are sorted ascending, even with duplicate values
            while( ai < al && bi < bl )
            {
                if      (union.length) // handle any possible duplicates inside SAME list
                {
                    if ( a[ai] === last )
                    {
                        ai++; continue;
                    }
                    else if ( b[bi] === last )
                    {
                        bi++; continue;
                    }
                }
                if      ( a[ai] < b[bi] )
                { 
                    union.push( last=a[ai++] ); 
                }
                else if ( a[ai] > b[bi] )
                { 
                    union.push( last=b[bi++] ); 
                }
                else // they're equal, push one unique
                {
                    union.push( last=a[ ai ] );
                    ai++; bi++;
                }
            }
            while ( ai < al ) if (a[ai++] !== last) union.push( last=a[ai-1] ); 
            while ( bi < bl ) if (b[bi++] !== last) union.push( last=b[bi-1] ); 
            return union;
        }],

        // Array DIFFERENCE of 2 arrays
        // returns difference array
        // https://github.com/foo123/sinful.js
        [Array, 'difference', function (a, b) {
            
            var ai = 0, bi = 0, diff = [ ],
                al = a.length, bl = b.length;
            // assume a, b lists are sorted ascending
            while( ai < al && bi < bl )
            {
                if      ( a[ai] < b[bi] )
                { 
                    diff.push( a[ ai ] );
                    ai++; 
                }
                else if ( a[ai] > b[bi] )
                { 
                    diff.push( b[ bi ] );
                    bi++; 
                }
                else // they're equal
                {
                    ai++; bi++;
                }
            }
            return diff;
        }],

        // Array INTERSECTION of 2 arrays
        // returns common unique values of both arrays
        // https://github.com/foo123/sinful.js
        [Array, 'intersection', function (a, b) {
            
            var ai = 0, bi = 0, intersection = [ ],
                al = a.length, bl = b.length;
            // assume a, b lists are sorted ascending
            while( ai < al && bi < bl )
            {
                if      ( a[ai] < b[bi] )
                { 
                    ai++; 
                }
                else if ( a[ai] > b[bi] )
                { 
                    bi++; 
                }
                else // they're equal
                {
                    intersection.push( a[ ai ] );
                    ai++; bi++;
                }
            }
            return intersection;
        }],

        [Array, 'shortest', function () {

            return slice(arguments).reduce(function (p, c) {
                return (p.length < c.length) ? p : c;
            });
        }],

        [Array, 'longest', function () {

            return slice(arguments).reduce(function (p, c) {
                return (p.length > c.length) ? p : c;
            });
        }],

        [Array, 'zip', function () {

            var args     = slice(arguments),
                shortest = Array.shortest.apply(null, args);

            return shortest.reduce(function (prev, cur, i) {

                prev.push(args.map(function (array) {
                    return array[i];
                }));

                return prev;

            }, []);
        }],

        [Array, 'greedyZip', function () {

            var args    = slice(arguments),
                longest = Array.longest.apply(null, args);

            return longest.reduce(function (prev, cur, i) {

                prev.push(args.map(function (array) {
                    return array[i];
                }));

                return prev;

            }, []);
        }],

        [Array, 'zipWith', function () {

            var zipper   = arguments[0],
                args     = slice(arguments, 1),
                shortest = Array.shortest.apply(null, args);

            return shortest.reduce(function (prev, cur, i) {

                prev.push(zipper.apply(null, args.map(function (array) {
                    return array[i];
                })));

                return prev;
            }, []);

        }],

        [Array, 'greedyZipWith', function () {

            var zipper  = arguments[0],
                args    = slice(arguments, 1),
                longest = Array.longest.apply(null, args);

            return longest.reduce(function (prev, cur, i) {

                prev.push(zipper.apply(null, args.map(function (array) {
                    return array[i];
                })));

                return prev;
            }, []);

        }],

        // Array unbiased shuffling
        // using Fisher-Yates-Knuth shuffle algorithm
        // http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
        // https://github.com/foo123/sinful.js
        [Array.prototype, 'shuffle', function (cyclic, copied) {
            
            var N, perm, swap, 
                offset = true === cyclic ? 1 : 0,
                a = true === copied ? this.slice() : this;
            N = a.length;
            while ( offset < N-- )
            { 
                perm = Math.round((N-offset)*Math.random()); 
                swap = a[ N ]; 
                a[ N ] = a[ perm ]; 
                a[ perm ] = swap; 
            }
            // in-place
            return arr;
        }],
        
        // Array unbiased partial shuffling, indicated by included indices
        // using variation of Fisher-Yates-Knuth shuffle algorithm
        // http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
        // https://github.com/foo123/sinful.js
        [Array.prototype, 'shuffle_only', function (included, cyclic, copied) {
            
            var N, perm, swap, 
                offset = true === cyclic ? 1 : 0,
                a = true === copied ? this.slice() : this;
            N = included.length;
            while ( offset < N-- )
            { 
                perm = Math.round((N-offset)*Math.random()); 
                swap = a[ included[N] ]; 
                a[ included[N] ] = a[ included[perm] ]; 
                a[ included[perm] ] = swap; 
            }
            // in-place
            return arr;
        }],
        
        // Array unbiased random selection of k elements
        // using variation of Fisher-Yates-Knuth shuffle algorithm
        // http://stackoverflow.com/a/32035986/3591273
        // https://github.com/foo123/sinful.js
        [Array.prototype, 'pick', function (k, non_destructive) {
            
            var a = this, n = a.length,
                picked, backup, i, selected, value;
                k = Math.min( k, n );
                picked = new Array( k ); 
                backup = new Array( k );
            
            non_destructive = false !== non_destructive;
            // partially shuffle the array, and generate unbiased selection simultaneously
            // this is a variation on fisher-yates-knuth shuffle
            for (i=0; i<k; i++) // O(k) times
            { 
                --n;
                selected = Math.round(n*Math.random()); // unbiased sampling n * n-1 * n-2 * .. * n-k+1
                value = a[ selected ];
                a[ selected ] = a[ n ];
                a[ n ] = value;
                backup[ i ] = selected;
                picked[ i ] = value;
            }
            if ( non_destructive )
            {
                // restore partially shuffled input array from backup
                for (i=k-1; i>=0; i--) // O(k) times
                { 
                    selected = backup[ i ];
                    value = a[ n ];
                    a[ n ] = a[ selected ];
                    a[ selected ] = value;
                    n++;
                }
            }
            return picked;
        }],
        
        // Array unbiased random selection of k elements, 
        // from part of Array indiocated in included indices
        // using variation of Fisher-Yates-Knuth shuffle algorithm
        // http://stackoverflow.com/a/32035986/3591273
        // https://github.com/foo123/sinful.js
        [Array.prototype, 'pick_only', function (k, included, non_destructive) {
            
            var a = this, n = a.length,
                picked, backup, i, selected, value, 
                index, ni = included.length;
                k = Math.min( k, n );
                picked = new Array( k );
                backup = new Array( k );
            
            non_destructive = false !== non_destructive;
            // partially shuffle the array, and generate unbiased selection simultaneously
            // this is a variation on fisher-yates-knuth shuffle
            for (i=0; i<k; i++) // O(k) times
            { 
                --ni;
                index = Math.round(ni*Math.random()); // unbiased sampling n * n-1 * n-2 * .. * n-k+1
                selected = included[ index ];
                value = a[ selected ];
                included[ index ] = included[ ni ];
                included[ ni ] = selected;
                backup[ i ] = index;
                picked[ i ] = value;
            }
            if ( non_destructive )
            {
                // restore partially shuffled input array from backup
                for (i=k-1; i>=0; i--) // O(k) times
                { 
                    index = backup[ i ];
                    selected = included[ ni ];
                    included[ ni ] = included[ index ];
                    included[ index ] = selected;
                    ni++;
                }
            }
            return picked;
        }],
        
        [Array.prototype, 'unique', function (search) {

            search = search || this.indexOf;

            return this.reduce(function (result, each) {

                if (search.call(result, each) === -1) {
                    result.push(each);
                }

                return result;
            }, []);
        }],

        [Array.prototype, 'partition', function (length) {

            var result, each;

            if (typeof length === 'undefined' || length <= 0) {
                return [];
            }

            result = [];
            each   = [];

            this.forEach(function (value) {

                each.push(value);

                if (each.length === length) {
                    result.push(each);
                    each = [];
                }

            });

            return result.concat(each.length > 0 ? [ each ] : []);
        }],

        [Array.prototype, 'last', function () {
            return this[ this.length - 1 ];
        }],

        // https://github.com/foo123/sinful.js
        [Array.prototype, 'get', function (index) {
            // use negative indices to count from end of array
            // eg. array.get(-1), gets last element, if exists
            if ( index < 0 ) index += this.length;
            if ( index >=0 && index < this.length ) return this[ index ];
            // undefined
        }],



        [Number.prototype, 'limit', function (lower, upper) {

            if (this > upper) {
                return upper;
            } 
            else if (this < lower) {
                return lower;
            }

            return this.valueOf();
        }],

        [Number.prototype, 'times', function (fun) {
            var result = [];

            for (var i = 0; i < this; i++) {
                result.push(fun(i));
            }

            return result;
        }],

        [Number.prototype, 'to', function (limit, stepper) {

            var list = [],
                i    = this.valueOf(),
                continuePred;
            
            stepper = stepper || function (x) { return x + 1; };

            continuePred = (stepper(i) > i) ? function (x) { return x <= limit; } :
                                              function (x) { return x >= limit; };

            while (continuePred(i)) {
                list.push(i);
                i = stepper(i);
            }

            return list;
        }],



        [Math, 'add', function () {

            var corrFactor = correctionFactor.apply(null, arguments);

            function cback(accum, curr, currI, O) {
                return accum + corrFactor * curr;
            }

            return reduce(arguments, cback, 0) / corrFactor;
        }],

        [Math, 'sub', function () {

            var corrFactor = correctionFactor.apply(null, arguments),
                first      = arguments[0];

            function cback(accum, curr, currI, O) {
                return accum - corrFactor * curr;
            }

            delete arguments[0];

            return reduce(arguments, 
                    cback, first * corrFactor) / corrFactor;
        }],

        [Math, 'mul', function () {

            function cback(accum, curr, currI, O) {

                var corrFactor = correctionFactor(accum, curr);

                return (accum * corrFactor) * (curr * corrFactor) /
                    (corrFactor * corrFactor);
            }

            return reduce(arguments, cback, 1);
        }],

        [Math, 'div', function () {

            function cback(accum, curr, currI, O) {

                var corrFactor = correctionFactor(accum, curr);

                return (accum * corrFactor) / (curr * corrFactor);
            }

            return reduce(arguments, cback);
        }],


    ].forEach(function (blessing) {
        bless(blessing.shift(), blessing.shift(), blessing.shift());
    });
}(/* Provide your own 'bless' to be used as above if custom behavior needed. */);
