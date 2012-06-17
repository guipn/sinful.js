### sinful.js

Sinful will enhance the JavaScript environment in which it is run, providing it with functionalities that are often useful.

One of the ways in which this is done is augmenting existing prototypes, which is something that most priests and pastors will frown upon.

Sinful assumes the environment is a conformant ES5 implementation. For the sake of clarity and brevity, no checks or safeguards are employed. I assume that you know what you're doing.

Here are the enhancements it introduces:

## Strings

Strings are given the `interp`, `reverse` and `words` methods. The `String` object is also given an `ASCII` property whose value is an object whose own properties are `lowercase`, `uppercase`, `letters`, `digits`, `hexDigits` and `octDigits`. Examples:

<pre>
'abcdef'.reverse(); // -> 'fedcba'
'Hello, {name}!'.interp({ name: 'George' }); // -> 'Hello, George!'
'This is the "words" functionality'.words(); // -> ['This', 'is', 'the', '"words"', 'functionality']

String.ASCII.lowercase; // -> 'abcdefghijklmnopqrstuvwxyz'
String.ASCII.uppercase; // -> 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
String.ASCII.letters; // -> 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
String.ASCII.digits; // -> '0123456789' 
String.ASCII.hexDigits; // -> '0123456789abcdefABCDEF'
String.ASCII.octDigits; // -> '01234567'
</pre>


## Objects

Objects are given the `deepCopy` method. Example:

<pre>

{foo: [{bar: "bar", ref: null}]}.deepCopy(); // -> {foo: [{bar: "bar", ref: null}]} (different ones)

[[1, 2, [3, 4]], [3, [5, 6]]].deepCopy(); // -> [[1, 2, [3, 4]], [3, [5, 6]]] (different ones)

</pre>

## Functions

Functions are given the `curry` and `compose` methods. Examples:

<pre>
function plus(one, other) { return one + other; }

var plusOne = plus.curry(1);

plusOne(2); // -> 3
</pre>

<pre>
function square(x)   { return x * x; }
function negate(x)   { return -x;    }
function decrease(x) { return x - 1; }

negate.compose(square).compose(decrease)(10); // -> -81
</pre>


## Math

The `Math` object is given the `add`, `sub`, `mul`, `div` and `intdiv` properties, whose values are all functions designed to perform fundamental arithmetic that is free from the problems of floating point representation (such as the fact that 0.1 + 0.2 !== 0.3). Examples:

<pre>
Math.add(0.1, 0.2); // -> 0.3, instead of 0.30000000000000004
Math.sub(0.3, 0.2); // -> 0.1, instead of 0.09999999999999998
Math.mul(0.2, 0.1); // -> 0.02, instead of 0.020000000000000004
Math.div(0.3, 0.1); // -> 3, instead of 2.9999999999999996
</pre>


## Legal Information

Refer to [LEGAL] [legal]

[legal]: 
