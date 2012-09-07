// sinful.js
// ----------
//
// For the rationale, refer to http://github.com/guipn/sinful.js
//
// gdjs
///////


void function () {

    'use strict';

    var own      = Object.getOwnPropertyNames,
        bind     = Function.prototype.bind,
        liberate = bind.bind(Function.prototype.call),
        reduce   = liberate(Array.prototype.reduce),
        slice    = liberate(Array.prototype.slice);


    // All-or-nothing.

    function bless(thing, name, content) {
        
        if (typeof thing[name] !== 'undefined') {
            throw new Error('Sinful: ' + name + ' is already defined.');
        }

        thing[name] = content;
    }


    // Other helpers

    function argv() {

        return Array.isArray(arguments[0][0]) === false ?
                    slice(arguments[0]) :
                    arguments[0][0];
    }


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
        [String, 'ASCII', {

            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            letters:   'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
            digits:    '0123456789',
            hexDigits: '0123456789abcdefABCDEF',
            octDigits: '01234567'

        }],

        // Remembered where I saw this: Crockford's The Good Parts 

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

        [String.prototype, 'words', function () {
            return this.split(/\s+/);
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

        [Object.prototype, 'mapOwn', function (fun, thisArg) {
            return own(this).map(fun, thisArg);
        }],

        [Object.prototype, 'forEachOwn', function (fun, thisArg) {
            return own(this).forEach(fun, thisArg);
        }],

        [Object.prototype, 'deepCopy', (function(){
            // List of properties we do not want to copy to cloned functions
            var functionPropertyFilter = [
                "caller",
                "name",
                "arguments",
                "prototype",
                "length"
            ];

            // List of properties we do not want to copy to cloned arrays
            var arrayPropertyFilter = [
                "length"
            ];

            // makeCloneFunction -
            //   Wraps one of the clone* functions below so that we can manage
            //   all `thingStack` and `copyStack` oeprations in one place
            function makeCloneFunction(cloneThing) {
                return function (thing, thingStack, copyStack) {
                    var copy = cloneThing(thing);
                    thingStack.push(thing);
                    copyStack.push(copy);
                    return copy;
                };
            }

            // clonePrimitive -
            //   Clones booleans, strings, numbers, null and undefined
            //
            // NOTE: These values are not references so a `clone` is just the
            // value itself
            function clonePrimitive(primitive) {
                return primitive;
            }

            // cloneRegExp -
            //   Self-Explanatory
            function cloneRegExp(regexp) {
                return RegExp(regexp);
            }

            // cloneDate -
            //   Self-Explanatory
            function cloneDate(date) {
                return new Date(date.getTime());
            }

            // cloneFunction -
            //   A terrible hack to clone functions
            // 
            // NOTE: Since functions are also objects and may contain
            // properties, we recurse into the function and any properties
            // are filled in (using makeRecursiveCloneFunction)
            function cloneFunction(fn) {
                var copy = Function("return " + fn.toString() + ";")();
                copy.prototype = Object.getPrototypeOf(fn);
                return copy;
            }

            // cloneObject -
            //   Make an empty object that references the original's prototype
            //   properties are filled in later (recursively)
            //
            // NOTE: This will not properly clone `constructed` objects
            // because it is impossible to know what arguments the constructor
            // was originally invoked with
            function cloneObject(object) {
                return Object.create(Object.getPrototypeOf(object));
            }

            // cloneArray -
            //   Just make an empty array. Elements are cloned later.
            function cloneArray(array) {
                return [];
            }

            // makeRecursiveCloneFunction -
            //   Generates a function that recursively walks the properties of `thing`
            //   cloning it first with the function `cloneThing` and filtering 
            //   any properties by the `propertyFilter`
            function makeRecursiveCloneFunction(cloneThing, propertyFilter) {
                return function (thing, thingStack, copyStack) {
                    var copy = cloneThing(thing, thingStack, copyStack);
                    var clone = this;

                    var properties = Object.getOwnPropertyNames(thing).filter(function(prop){
                        return propertyFilter.indexOf(prop) === -1;
                    })

                    properties.forEach(function(prop) {
                        var thingOffset = thingStack.indexOf(thing[prop]);

                        if (thingOffset === -1) {
                            copy[prop] = clone(thing[prop]);
                        } else {
                            copy[prop] = copyStack[thingOffset];
                        }
                    });

                    return copy;
                };
            }

            // We only need one of these since they are all identical anyway
            var clonePrimitiveFunction = makeCloneFunction(clonePrimitive);

            var cloneFunctions = {
                "[object Null]": clonePrimitiveFunction,
                "[object Undefined]": clonePrimitiveFunction,
                "[object Number]": clonePrimitiveFunction,
                "[object String]": clonePrimitiveFunction,
                "[object Boolean]": clonePrimitiveFunction,
                "[object RegExp]": makeCloneFunction(cloneRegExp),
                "[object Date]": makeCloneFunction(cloneDate),
                "[object Function]": makeRecursiveCloneFunction(makeCloneFunction(cloneFunction), functionPropertyFilter),
                "[object Object]": makeRecursiveCloneFunction(makeCloneFunction(cloneObject), []),
                "[object Array]": makeRecursiveCloneFunction(makeCloneFunction(cloneArray), arrayPropertyFilter)
            };

            return function _deepCopy() {

                var thingStack = [],
                    copyStack = [];

                function clone(thing){
                    // This is the most certain way to get an object's type
                    var typeOfThing = Object.prototype.toString.call(thing);

                    // We have to call this function with `clone` because we
                    // use the `this` value to recursively clone objects
                    return cloneFunctions[typeOfThing].call(clone, thing, thingStack, copyStack);
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

        [Function, 'memoize', function (func, keyGen) {

            var cache = {};

            keyGen = keyGen || function (args) {
                return JSON.stringify(args);
            };

            return function () {

                var args = slice(arguments), 
                    key  = keyGen(args);

                return (typeof cache[key] === 'undefined') ? 
                    cache[key] = func(args) :
                    cache[key];
            };
        }],

        [Function, 'liberate', liberate],



        [Array, 'range', function (start, end, step) {

            var result = [], i = start;

            if (step == 0) {
                throw new Error('Step size must not evaluate to 0.');
            }

            while (i <= end) {
                result.push(i);
                i += step;
            }

            return result;
        }],

        [Array, 'discretize', function (start, end, count) {

            return (count == 0) ?
                    [] : 
                    Array.range(start, end, (end - start) / count);
        }],

        [Array, 'smallest', function () {

            return slice(arguments).reduce(function (p, c) {
                return (p.length < c.length) ? p : c;
            });
        }],

        [Array, 'biggest', function () {

            return slice(arguments).reduce(function (p, c) {
                return (p.length > c.length) ? p : c;
            });
        }],

        [Array, 'zip', function () {

            var args     = slice(arguments),
                smallest = Array.smallest.apply(null, args);

            return smallest.reduce(function (prev, cur, i) {

                prev.push(args.map(function (array) {
                    return array[i];
                }));

                return prev;

            }, []);
        }],

        [Array, 'zipWith', function () {

            var zipper   = arguments[0];
                args     = slice(arguments, 1),
                smallest = Array.smallest.apply(null, args);

            return smallest.reduce(function (prev, cur, i) {

                prev.push(zipper.apply(null, args.map(function (array) {
                    return array[i];
                })));

                return prev;
            }, []);

        }],

        [Array.prototype, 'clone', function () {
            return this.slice();
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



        [Number.prototype, 'limit', function (lower, upper) {

            if (this > upper) {
                return upper;
            } 
            else if (this < lower) {
                return lower;
            }

            return this.valueOf();
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

        [Math, 'intDiv', function (left, right) {

            var div   = Math.div(left, right),
                parts = div.toString().split('.');

            return (parts.length) ?
                (new Number(parts[0])).valueOf() :
                div;
        }],


        [Math, 'arithmeticMean', function () {

            var numbers = argv(arguments);

            if (arguments.length === 0) {
                return undefined;
            }

            return numbers.reduce(function (sum, curr) {
                return sum + curr;
            }, 0) / numbers.length;
        }],

        [Math, 'geometricMean', function () {

            var numbers = argv(arguments);

            if (arguments.length === 0) {
                return undefined;
            }

            return Math.sqrt(numbers.reduce(function (product, curr) {
                return product * curr;
            }, 1));
        }]

    ].forEach(function (blessing) {
        bless(blessing.shift(), blessing.shift(), blessing.shift());
    });
}();
