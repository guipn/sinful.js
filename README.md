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


### String.prototype.truncate(maxLen, suffix)

 Returns a string whose length is not greater than `maxLen`. If this string's length is greater than `maxLen`, the truncation `suffix` is appended to its end. If `maxLen` is falsy, `50` is used. If `suffix` is falsy, `'...'` is used.

<pre>
'1234567'.truncate(5); // ↦ '12...'
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


### Function.memoize(func, keyGen)

 Returns a new function which performs equivalent computation to that of `func`, but that caches results, potentially improving speed. The `keyGen` parameter is a function taking an array with the parameters received in a call to your function. If `keyGen` is falsy, the default behavior is to serialize such array with `JSON.stringify`. Example:

<pre>
// Excuse the indentation. This has to do with Markdown.

function fib(n) {

    if (n == 1) {
	return 1; 
    } else if (n == 0) {
	return 0;
    }

    return fib(n - 1) + fib(n - 2);
}

fib(20); // 21891 function calls made
fib(25); // 242785 function calls made
fib(25); // 242785 function calls made

var fib = Function.memoize(fib);

fib(20); // 60 function calls made
fib(25); // 16 function calls made
fib(25); // 1 function call made
</pre>

 The improvements are often drastic, particularly for recursive functions, but remember that it does not always make sense to memoize. If the interesting part of your function are its side-effects, it makes no sense to memoize, since doing so merely decreases the return time by skipping repeated computation. Functions that are not [referentially transparent] (http://www.haskell.org/haskellwiki/Referential_transparency) - which do not depend only on their arguments - are often very bad candidates. Functions may be tied to factors such as time, system load, etc., which must not be overlooked when considering memoization.
 
 The default behavior of `keyGen` is undesired at times. Receiving objects as parameters requires clearly defining identity (remember - the order of object properties is unspecified). 

 Overall, [pure functions] (http://www.haskell.org/haskellwiki/Functional_programming#Purity) that are referentially transparent are great candidates. The `Function.memoize` function introduces very little noise, and does not touch the original function's implementation at all. Applying it is only a matter of writing `var foo = Function.memoize(foo);`, and removing memoization is as easy as deleting that statement.



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


### Array.prototype.unique(search)

 Returns an array comprised of the unique values of this array. The `search` paramater is a function operating on an array bound to `this` and taking one parameter, which should return `-1` if the parameter is not in the array, and any other value otherwise.

 If `search` is not specified, the `indexOf` function is used.

 <pre>
 [2, 2, 2, 3, 3, 1, 2, 3, 4, 1,3, 3, 4, 2, 1, 2, 3, 3, 4, 1].unique(); // ↦ [2, 3, 1, 4]
 </pre>



## Math

ECMAScript performs floating point arithmetic to compute `+`, `-`, `*` and `/`. You should understand [why this is a problem] (http://dl.acm.org/citation.cfm?id=103163). Sinful gives the `Math` object the `add`, `sub`, `mul`, `div` and `intdiv` properties, whose values are all functions designed to perform fundamental arithmetic that is free from the problems of floating point representation (such as the fact that 0.1 + 0.2 !== 0.3). Examples:

<pre>
Math.add(0.1, 0.2); // ↦ 0.3, instead of 0.30000000000000004
Math.sub(0.3, 0.2); // ↦ 0.1, instead of 0.09999999999999998
Math.mul(0.2, 0.1); // ↦ 0.02, instead of 0.020000000000000004
Math.div(0.3, 0.1); // ↦ 3, instead of 2.9999999999999996
</pre>



## Legal Information

Refer to [LEGAL] [legal]

[legal]: https://github.com/guipn/sinful.js/blob/master/LEGAL
