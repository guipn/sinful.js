# sinful.js

Sinful will enhance the JavaScript environment in which it is run, providing it with functionalities that are often useful.

One of the ways in which this is done is augmenting existing prototypes, which is something that most priests and pastors will frown upon.

Sinful assumes the environment is a conformant ES5 implementation. For the sake of clarity and brevity, no checks or safeguards are employed. I assume that you know what you're doing.

Here are the enhancements it introduces:


## Strings

### String.ASCII

 The value of the `ASCII` property given to `String` is an object whose own properties are the useful ASCII alphabets `lowercase`, `uppercase`, `letters`, `digits`, `hexDigits` and `octDigits`:

<pre>
String.ASCII.lowercase; // ↦ 'abcdefghijklmnopqrstuvwxyz'
String.ASCII.uppercase; // ↦ 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
String.ASCII.letters; // ↦ 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
String.ASCII.digits; // ↦ '0123456789' 
String.ASCII.hexDigits; // ↦ '0123456789abcdefABCDEF'
String.ASCII.octDigits; // ↦ '01234567'
</pre>


### String.prototype.reverse()

 Self-explanatory:

<pre>
'abcdef'.reverse(); // ↦ 'fedcba'
</pre>


### String.prototype.interp(kv)

 Returns a string composed of the interpolated values for the given keys. Key/value pairs are given by a parameter object:

<pre>
'{name} is {age}.'.interp({ 
    name: 'George',
    age:  30
}); // ↦ 'George is 30.'
</pre>


### String.prototype.words()

 Returns an array given by splitting this string on spaces:

<pre>
'This is the "words" functionality'.words(); // ↦ ['This', 'is', 'the', '"words"', 'functionality']
</pre>


### String.prototype.echo(times)

 Returns a string made of `times` repetitions of this string:

<pre>
'echo\n'.echo(3); // ↦ 'echo\necho\necho'
</pre>



## Objects

### Object.prototype.deepCopy()

Recursively mirrors this object's own property/values:

<pre>

{foo: [{bar: "bar", ref: null}]}.deepCopy(); // ↦ {foo: [{bar: "bar", ref: null}]} (different ones)

[[1, 2, [3, 4]], [3, [5, 6]]].deepCopy(); // ↦ [[1, 2, [3, 4]], [3, [5, 6]]] (different ones)

</pre>



## Functions

### Function.prototype.curry()

 Partially applies this function to the given arguments and returns that new function:

<pre>
function plus(one, other) { return one + other; }

var plusOne = plus.curry(1);

plusOne(2); // ↦ 3
</pre>


### Function.prototype.compose()

 Analogue of the `.` operator in Haskell, and the `∘` operator in Mathematics. 
 
 For this function (`f`), and given some other function `g`, returns a new function `f ∘ g`, such that `(f ∘ g)(x)` is the same as `f(g(x))`. 

<pre>
function square(x)   { return x * x; }
function negate(x)   { return -x;    }
function decrease(x) { return x - 1; }

negate.compose(square).compose(decrease)(10); // ↦ -81
</pre>

Together, the `curry` and `compose` functions bless the environment with strong reuse possibilities. New functions may be built out of existing ones with less verbosity than before, yet maintaining readability and clarity.



## Arrays

### Array.range(start, end, step)

 Returns a new array whose values are the numbers in the (discrete) interval going from `start` to `end`, by successive increments of `step`, for `step ≠ 0`. If such increments add up to `end`, starting at `start`, then `end` is included. 

<pre>
Array.range(0, 10, 1); // ↦ [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
Array.range(0, 10, 7); // ↦ [0, 7]
</pre>

### Array.discretize(start, end, count)

 Returns an array whose values are the points given by the division of the (`start`, `end`) range into `count` parts. If `count` is 0, an empty array is returned.

<pre>
Array.discretize(0, 10, 10); // ↦ [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
</pre>



## Math

ECMAScript performs floating point arithmetic to copmute `+`, `-`, `*` and `/`. You should understand [why this is a problem] (http://dl.acm.org/citation.cfm?id=103163). Sinful gives the `Math` object the `add`, `sub`, `mul`, `div` and `intdiv` properties, whose values are all functions designed to perform fundamental arithmetic that is free from the problems of floating point representation (such as the fact that 0.1 + 0.2 !== 0.3). Examples:

<pre>
Math.add(0.1, 0.2); // ↦ 0.3, instead of 0.30000000000000004
Math.sub(0.3, 0.2); // ↦ 0.1, instead of 0.09999999999999998
Math.mul(0.2, 0.1); // ↦ 0.02, instead of 0.020000000000000004
Math.div(0.3, 0.1); // ↦ 3, instead of 2.9999999999999996
</pre>



## Legal Information

Refer to [LEGAL] [legal]

[legal]: https://github.com/guipn/sinful.js/blob/master/LEGAL
