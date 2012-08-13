# sinful.js

Sinful will enhance the JavaScript environment in which it is run, providing it with functionalities that are often useful. Some of these include:

+ Deep copying of objects;
+ Partial application and function composition;
+ Unobtrusive, automatic memoization;
+ Tuple zipping and 'zip-withing';
+ Basic arithmetic that is free of floating point errors;
+ ...

One of the ways in which this is done is augmenting existing prototypes, which is something that most priests and pastors will frown upon. *The rationale* is that with JavaScript supporting object orientation, we should enjoy it when possible. While current production-ready libraries are right to seek harmony through the ugliness of namespacing, sinful.js is about enabling the writing of beautiful, flowing code. 

While `$_lib_mess.String.echo('bar', 3);` is safe(r) and not aesthetically terrible, it surely is not as beautiful as `'bar'.echo(3);`.

JavaScript's motherland is permanently dynamic and often dangerous, and yes, we should strive to remain sane. I trust that users of this library know what code they're running and when. Nevertheless, I'm considering adding an all-or-nothing principle of no contention.



## Strings

### String.ASCII

 The value of the `ASCII` property given to `String` is an object whose own properties are the useful ASCII alphabets `lowercase`, `uppercase`, `letters`, `digits`, `hexDigits` and `octDigits`:

<pre>
String.ASCII.lowercase; // ↦ 'abcdefghijklmnopqrstuvwxyz'
String.ASCII.uppercase; // ↦ 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
String.ASCII.letters;   // ↦ 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
String.ASCII.digits;    // ↦ '0123456789' 
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


### String.prototype.repeat(times, [sep])

 Returns a string made of `times` repetitions of this string, separated by `sep`:

<pre>
'echo\n'.repeat(3);     // ↦ 'echo\necho\necho'
'echo'.repeat(3, '\n'); // ↦ 'echo\necho\necho'
</pre>


### String.prototype.truncate(maxLen, [suffix])

 Returns a string whose length is not greater than `maxLen`. If this string's length is greater than `maxLen`, the truncation `suffix` is appended to its end. If `maxLen` is falsy, `50` is used. If `suffix` is falsy, `'...'` is used.

<pre>
'1234567'.truncate(5); // ↦ '12...'
</pre>



## Objects

### Object.prototype.deepCopy()

 Recursively mirrors this object's own property/values:

<pre>

{foo: [{bar: "bar", ref: null}]}.deepCopy(); // ↦ {foo: [{bar: "bar", ref: null}]} (different ones)

[[1, 2, [3, 4]], [3, [5, 6]]].deepCopy();    // ↦ [[1, 2, [3, 4]], [3, [5, 6]]] (different ones)

</pre>


### Object.prototype.mapOwn(func, [self])

 Returns an array whose elements are the results of calling `func` on every string that is a property name of `this`. At every iteration, `func` receives the name of a property, its index within the complete array of properties and the array of properties itself, in that order. The optional parameter `self` is bound to `this` in `func`, for every call. Directly equivalent to saying `Object.getOwnPropertyNames(obj).map(func, self)`.

<pre>
({ foo: 10, bar: false }).mapOwn(function (prop, i, props) { 
    return prop.toUpperCase(); 
}) // ↦ ["FOO", "BAR"]
</pre>


### Object.prototype.forEachOwn(func, [self])

 The same as `mapOwn`, only no array is returned.



## Functions

### Function.prototype.curry([depth])

 Returns a [curried] (http://www.haskell.org/haskellwiki/Currying) version of the given function. 
 Supposing `f` is defined over `n` parameters, `f.curry()` is a function taking 1 parameter and returning a function that is the result of partially applying `f` to the given parameter. This repeats until `n` applications are met (so, for `f.curry()`, `n - 1` more times), at which stage the value and side effects given by a complete application of `f` are reached.
 It is also possible to partially apply `f` to more than a single argument, and the same is true for all intermediate applications. In code:

<pre>
function add3(one, two, three) {
    return one + two + three;
}

add3.curry()(1)(2)(3); // ↦ 6
add3.curry()(1)(2, 3); // ↦ 6
add3.curry()(1, 2)(3); // ↦ 6
add3.curry()(1, 2, 3); // ↦ 6
</pre>

 Different semantics must be defined for the following scenario:

<pre>
function product() {
    return Array.prototype.slice.call(arguments).reduce(function (p, n) {
        return p * n;
    }, 1);
}
</pre>

 Since `product` has variable arity, full application could never be reached according to the semantics previously described. 
 
 To remedy this, the optional `depth` parameter can be given, so as to inform `curry` of how many parameters are needed to completely define the computation:

<pre>
var product3 = product.curry(3);

product3(1)(2)(3); // ↦ 6
</pre>


### Function.prototype.compose(g)

 Analogue of the `.` operator in Haskell, and the `∘` operator in Mathematics. 
 
 For this function (`f`), and given some other function `g`, returns a new function `f ∘ g`, such that `(f ∘ g)(x)` is the same as `f(g(x))`. 

<pre>
function square(x)   { return x * x; }
function negate(x)   { return -x;    }
function decrease(x) { return x - 1; }

negate.compose(square).compose(decrease)(10); // ↦ -81
</pre>

Together, the `curry` and `compose` functions bless the environment with strong reuse possibilities. New functions may be built out of existing ones with less verbosity than before, yet maintaining readability and clarity.


### Function.prototype.iterate(target)

 Returns a function whose subsequent applications return the value of the original function applied to the last result:

<pre>
function square(x) {
   return x * x;
}

var sqs = square.iterate(2);

sqs(); // ↦ 4
sqs(); // ↦ 16
sqs(); // ↦ 256
sqs(); // ↦ 65536
</pre>


### Function.memoize(func, [keyGen])

 Returns a new function which performs equivalent computation to that of `func`, but that caches results, potentially improving speed. The `keyGen` parameter is a function taking an array with the parameters received in a call to your function. If `keyGen` is falsy, the default behavior is to serialize such array with `JSON.stringify`. Example:

<pre>
function fib(n) {

    if (n == 1 || n == 0) {
        return n;
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


### Function.liberate(func)

 Creates a function whose invocation causes the invocation of `func`. Its first parameter is bound to `this` in said invocation, and the remaining are passed as arguments. This can be used to make code clearer, because it frees the writer from saying `Lender.prototype.func.apply(foo, [args])` or `Lender.prototype.call(foo, ...)`:

<pre>
var slice = Function.liberate(Array.prototype.slice);

function variadic() {

    var args = slice(arguments); // As opposed to slice.call(arguments);

    // ...

}
</pre>



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


### Array.smallest(...), Array.biggest(...)

 These return the array whose length is the smallest or biggest, respectively:

<pre>
Array.smallest([1], [2, 2], [3, 3, 3]); // ↦ [1]
Array.biggest([1], [2, 2], [3, 3, 3]);  // ↦ [3, 3, 3]
</pre>


### Array.zip(...)

 Given arrays as parameters, returns an array whose length is that of the smallest one. Each element of the result is an array whose elements are the *ith* elements of each of the parameters (a tuple):

<pre>
Array.zip([1, 1, 1, 1], [2, 2, 2], [3, 3, 3, 3, 3, 3, 3]); // ↦ [[1, 2, 3], [1, 2, 3], [1, 2, 3]]
</pre>


### Array.zipWith(f, ...)

 The same as `Array.zip`, only taking as initial parameter a function, and instead of returning 'tuples', returns the result of applying said function to the *ith* elements of each parameter array:

<pre>
function add(a, b, c) {
    return a + b + c;
}

Array.zipWith(add, [1, 1, 1, 1], [2, 2, 2], [3, 3, 3, 3, 3, 3, 3]); ↦ [6, 6, 6]
</pre>


### Array.prototype.unique([search])

 Returns an array comprised of the unique values of this array. The `search` paramater is a function operating on an array bound to `this` and taking one parameter, which should return `-1` if the parameter is not in the array, and any other value otherwise.

 If `search` is not specified, the `indexOf` function is used.

 <pre>
 [2, 2, 2, 3, 3, 1, 2, 3, 4, 1, 3, 3, 4, 2, 1, 2, 3, 3, 4, 1].unique(); // ↦ [2, 3, 1, 4]
 </pre>


### Array.prototype.partition(length)

 Returns a new array containing this array broken up into subarrays of size `length`.

<pre>
 [1, 2, 3, 4, 5].partition(2); // ↦ [[1, 2], [3, 4], [5]]
</pre>


### Array.prototype.last()

 Sugar for `foo[ foo.length - 1 ]`.



## Math

### Basic Arithmetic

ECMAScript performs floating point arithmetic to compute `+`, `-`, `*` and `/`. You should understand [why this is a problem] (http://dl.acm.org/citation.cfm?id=103163). Sinful gives the `Math` object the `add`, `sub`, `mul`, `div` and `intdiv` properties, whose values are all functions designed to perform fundamental arithmetic that is free from the problems of floating point representation (such as the fact that 0.1 + 0.2 !== 0.3). Examples:

<pre>
Math.add(0.1, 0.2); // ↦ 0.3, instead of 0.30000000000000004
Math.sub(0.3, 0.2); // ↦ 0.1, instead of 0.09999999999999998
Math.mul(0.2, 0.1); // ↦ 0.02, instead of 0.020000000000000004
Math.div(0.3, 0.1); // ↦ 3, instead of 2.9999999999999996
</pre>


### Math.arithmeticMean(...) / Math.arithmeticMean(numbers)

Takes parameters like `Math.max`, but returns their arithmetic mean, or `undefined` if the list has no values:

<pre>
Math.arithmeticMean(8, 10);   // ↦ 9
Math.arithmeticMean([8, 10]); // ↦ 9
</pre>


### Math.geometricMean(...) / Math.geometricMean(numbers)

Takes parameters like `Math.max`, but returns their geometric mean, or `undefined` if the list has no values:

<pre>
Math.geometricMean([3, 4, 5]); // ↦ 7.745966692414834
Math.geometricMean(3, 4, 5);   // ↦ 7.745966692414834
</pre>



## Numbers

### Number.prototype.limit(lower, upper)

 Limits this number's value to the given bounds:

<pre>
var nmb = 100;

nmb.limit(0, 50);    // ↦ 50
nmb.limit(50, 150);  // ↦ 100
nmb.limit(150, 200); // ↦ 150
</pre>



## Legal Information

Refer to [LEGAL] [legal]

[legal]: https://github.com/guipn/sinful.js/blob/master/LEGAL
