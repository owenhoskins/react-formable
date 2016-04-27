(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.formable = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Array.prototype.find - MIT License (c) 2013 Paul Miller <http://paulmillr.com>
// For all details and docs: https://github.com/paulmillr/array.prototype.find
'use strict';
var ES = require('es-abstract/es6');

module.exports = function find(predicate) {
	var list = ES.ToObject(this);
	var length = ES.ToInteger(ES.ToLength(list.length));
	if (!ES.IsCallable(predicate)) {
		throw new TypeError('Array#find: predicate must be a function');
	}
	if (length === 0) return undefined;
	var thisArg = arguments[1];
	for (var i = 0, value; i < length; i++) {
		value = list[i];
		if (ES.Call(predicate, thisArg, [value, i, list])) return value;
	}
	return undefined;
};

},{"es-abstract/es6":7}],2:[function(require,module,exports){
'use strict';

var define = require('define-properties');
var ES = require('es-abstract/es6');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

var slice = Array.prototype.slice;

var boundFindShim = function find(array, predicate) {
	ES.RequireObjectCoercible(array);
	return implementation.apply(array, predicate);
};

define(boundFindShim, {
	implementation: implementation,
	getPolyfill: getPolyfill,
	shim: shim
});

module.exports = boundFindShim;

},{"./implementation":1,"./polyfill":3,"./shim":4,"define-properties":5,"es-abstract/es6":7}],3:[function(require,module,exports){
'use strict';

module.exports = function getPolyfill() {
	// Detect if an implementation exists
	// Detect early implementations which skipped holes in sparse arrays
	var implemented = Array.prototype.find && [, 1].find(function (item, index) {
		return index === 0;
	});

	return implemented ? Array.prototype.find : require('./implementation');
};

},{"./implementation":1}],4:[function(require,module,exports){
'use strict';

var define = require('define-properties');
var getPolyfill = require('./polyfill');

module.exports = function shimArrayPrototypeFind() {
	var polyfill = getPolyfill();

	define(Array.prototype, { find: polyfill }, {
		find: function () {
			return Array.prototype.find !== polyfill;
		}
	});

	return polyfill;
};

},{"./polyfill":3,"define-properties":5}],5:[function(require,module,exports){
'use strict';

var keys = require('object-keys');
var foreach = require('foreach');
var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

var toStr = Object.prototype.toString;

var isFunction = function (fn) {
	return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
};

var arePropertyDescriptorsSupported = function () {
	var obj = {};
	try {
		Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
        /* eslint-disable no-unused-vars, no-restricted-syntax */
        for (var _ in obj) { return false; }
        /* eslint-enable no-unused-vars, no-restricted-syntax */
		return obj.x === obj;
	} catch (e) { /* this is IE 8. */
		return false;
	}
};
var supportsDescriptors = Object.defineProperty && arePropertyDescriptorsSupported();

var defineProperty = function (object, name, value, predicate) {
	if (name in object && (!isFunction(predicate) || !predicate())) {
		return;
	}
	if (supportsDescriptors) {
		Object.defineProperty(object, name, {
			configurable: true,
			enumerable: false,
			value: value,
			writable: true
		});
	} else {
		object[name] = value;
	}
};

var defineProperties = function (object, map) {
	var predicates = arguments.length > 2 ? arguments[2] : {};
	var props = keys(map);
	if (hasSymbols) {
		props = props.concat(Object.getOwnPropertySymbols(map));
	}
	foreach(props, function (name) {
		defineProperty(object, name, map[name], predicates[name]);
	});
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

module.exports = defineProperties;

},{"foreach":16,"object-keys":23}],6:[function(require,module,exports){
'use strict';

var $isNaN = Number.isNaN || function (a) { return a !== a; };
var $isFinite = require('./helpers/isFinite');

var sign = require('./helpers/sign');
var mod = require('./helpers/mod');

var IsCallable = require('is-callable');
var toPrimitive = require('es-to-primitive/es5');

// https://es5.github.io/#x9
var ES5 = {
	ToPrimitive: toPrimitive,

	ToBoolean: function ToBoolean(value) {
		return Boolean(value);
	},
	ToNumber: function ToNumber(value) {
		return Number(value);
	},
	ToInteger: function ToInteger(value) {
		var number = this.ToNumber(value);
		if ($isNaN(number)) { return 0; }
		if (number === 0 || !$isFinite(number)) { return number; }
		return sign(number) * Math.floor(Math.abs(number));
	},
	ToInt32: function ToInt32(x) {
		return this.ToNumber(x) >> 0;
	},
	ToUint32: function ToUint32(x) {
		return this.ToNumber(x) >>> 0;
	},
	ToUint16: function ToUint16(value) {
		var number = this.ToNumber(value);
		if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
		var posInt = sign(number) * Math.floor(Math.abs(number));
		return mod(posInt, 0x10000);
	},
	ToString: function ToString(value) {
		return String(value);
	},
	ToObject: function ToObject(value) {
		this.CheckObjectCoercible(value);
		return Object(value);
	},
	CheckObjectCoercible: function CheckObjectCoercible(value, optMessage) {
		/* jshint eqnull:true */
		if (value == null) {
			throw new TypeError(optMessage || 'Cannot call method on ' + value);
		}
		return value;
	},
	IsCallable: IsCallable,
	SameValue: function SameValue(x, y) {
		if (x === y) { // 0 === -0, but they are not identical.
			if (x === 0) { return 1 / x === 1 / y; }
			return true;
		}
        return $isNaN(x) && $isNaN(y);
	}
};

module.exports = ES5;

},{"./helpers/isFinite":9,"./helpers/mod":11,"./helpers/sign":12,"es-to-primitive/es5":13,"is-callable":19}],7:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';
var symbolToStr = hasSymbols ? Symbol.prototype.toString : toStr;

var $isNaN = Number.isNaN || function (a) { return a !== a; };
var $isFinite = require('./helpers/isFinite');
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;

var assign = require('./helpers/assign');
var sign = require('./helpers/sign');
var mod = require('./helpers/mod');
var isPrimitive = require('./helpers/isPrimitive');
var toPrimitive = require('es-to-primitive/es6');
var parseInteger = parseInt;
var bind = require('function-bind');
var strSlice = bind.call(Function.call, String.prototype.slice);
var isBinary = bind.call(Function.call, RegExp.prototype.test, /^0b[01]+$/i);
var isOctal = bind.call(Function.call, RegExp.prototype.test, /^0o[0-7]+$/i);
var nonWS = ['\u0085', '\u200b', '\ufffe'].join('');
var nonWSregex = new RegExp('[' + nonWS + ']', 'g');
var hasNonWS = bind.call(Function.call, RegExp.prototype.test, nonWSregex);
var invalidHexLiteral = /^[\-\+]0x[0-9a-f]+$/i;
var isInvalidHexLiteral = bind.call(Function.call, RegExp.prototype.test, invalidHexLiteral);

// whitespace from: http://es5.github.io/#x15.5.4.20
// implementation from https://github.com/es-shims/es5-shim/blob/v3.4.0/es5-shim.js#L1304-L1324
var ws = [
	'\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003',
	'\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028',
	'\u2029\uFEFF'
].join('');
var trimRegex = new RegExp('(^[' + ws + ']+)|([' + ws + ']+$)', 'g');
var replace = bind.call(Function.call, String.prototype.replace);
var trim = function (value) {
	return replace(value, trimRegex, '');
};

var ES5 = require('./es5');

var hasRegExpMatcher = require('is-regex');

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-abstract-operations
var ES6 = assign(assign({}, ES5), {

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-call-f-v-args
	Call: function Call(F, V) {
		var args = arguments.length > 2 ? arguments[2] : [];
		if (!this.IsCallable(F)) {
			throw new TypeError(F + ' is not a function');
		}
		return F.apply(V, args);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toprimitive
	ToPrimitive: toPrimitive,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toboolean
	// ToBoolean: ES5.ToBoolean,

	// http://www.ecma-international.org/ecma-262/6.0/#sec-tonumber
	ToNumber: function ToNumber(argument) {
		var value = isPrimitive(argument) ? argument : toPrimitive(argument, 'number');
		if (typeof value === 'symbol') {
			throw new TypeError('Cannot convert a Symbol value to a number');
		}
		if (typeof value === 'string') {
			if (isBinary(value)) {
				return this.ToNumber(parseInteger(strSlice(value, 2), 2));
			} else if (isOctal(value)) {
				return this.ToNumber(parseInteger(strSlice(value, 2), 8));
			} else if (hasNonWS(value) || isInvalidHexLiteral(value)) {
				return NaN;
			} else {
				var trimmed = trim(value);
				if (trimmed !== value) {
					return this.ToNumber(trimmed);
				}
			}
		}
		return Number(value);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tointeger
	// ToInteger: ES5.ToNumber,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint32
	// ToInt32: ES5.ToInt32,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint32
	// ToUint32: ES5.ToUint32,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint16
	ToInt16: function ToInt16(argument) {
		var int16bit = this.ToUint16(argument);
		return int16bit >= 0x8000 ? int16bit - 0x10000 : int16bit;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint16
	// ToUint16: ES5.ToUint16,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint8
	ToInt8: function ToInt8(argument) {
		var int8bit = this.ToUint8(argument);
		return int8bit >= 0x80 ? int8bit - 0x100 : int8bit;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8
	ToUint8: function ToUint8(argument) {
		var number = this.ToNumber(argument);
		if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
		var posInt = sign(number) * Math.floor(Math.abs(number));
		return mod(posInt, 0x100);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8clamp
	ToUint8Clamp: function ToUint8Clamp(argument) {
		var number = this.ToNumber(argument);
		if ($isNaN(number) || number <= 0) { return 0; }
		if (number >= 0xFF) { return 0xFF; }
		var f = Math.floor(argument);
		if (f + 0.5 < number) { return f + 1; }
		if (number < f + 0.5) { return f; }
		if (f % 2 !== 0) { return f + 1; }
		return f;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tostring
	ToString: function ToString(argument) {
		if (typeof argument === 'symbol') {
			throw new TypeError('Cannot convert a Symbol value to a string');
		}
		return String(argument);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toobject
	ToObject: function ToObject(value) {
		this.RequireObjectCoercible(value);
		return Object(value);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-topropertykey
	ToPropertyKey: function ToPropertyKey(argument) {
		var key = this.ToPrimitive(argument, String);
		return typeof key === 'symbol' ? symbolToStr.call(key) : this.ToString(key);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	ToLength: function ToLength(argument) {
		var len = this.ToInteger(argument);
		if (len <= 0) { return 0; } // includes converting -0 to +0
		if (len > MAX_SAFE_INTEGER) { return MAX_SAFE_INTEGER; }
		return len;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-canonicalnumericindexstring
	CanonicalNumericIndexString: function CanonicalNumericIndexString(argument) {
		if (toStr.call(argument) !== '[object String]') {
			throw new TypeError('must be a string');
		}
		if (argument === '-0') { return -0; }
		var n = this.ToNumber(argument);
		if (this.SameValue(this.ToString(n), argument)) { return n; }
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-requireobjectcoercible
	RequireObjectCoercible: ES5.CheckObjectCoercible,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isarray
	IsArray: Array.isArray || function IsArray(argument) {
		return toStr.call(argument) === '[object Array]';
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-iscallable
	// IsCallable: ES5.IsCallable,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isconstructor
	IsConstructor: function IsConstructor(argument) {
		return this.IsCallable(argument); // unfortunately there's no way to truly check this without try/catch `new argument`
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isextensible-o
	IsExtensible: function IsExtensible(obj) {
		if (!Object.preventExtensions) { return true; }
		if (isPrimitive(obj)) {
			return false;
		}
		return Object.isExtensible(obj);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isinteger
	IsInteger: function IsInteger(argument) {
		if (typeof argument !== 'number' || $isNaN(argument) || !$isFinite(argument)) {
			return false;
		}
		var abs = Math.abs(argument);
		return Math.floor(abs) === abs;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-ispropertykey
	IsPropertyKey: function IsPropertyKey(argument) {
		return typeof argument === 'string' || typeof argument === 'symbol';
	},

	// http://www.ecma-international.org/ecma-262/6.0/#sec-isregexp
	IsRegExp: function IsRegExp(argument) {
		if (!argument || typeof argument !== 'object') {
			return false;
		}
		if (hasSymbols) {
			var isRegExp = RegExp[Symbol.match];
			if (typeof isRegExp !== 'undefined') {
				return ES5.ToBoolean(isRegExp);
			}
		}
		return hasRegExpMatcher(argument);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevalue
	// SameValue: ES5.SameValue,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero
	SameValueZero: function SameValueZero(x, y) {
		return (x === y) || ($isNaN(x) && $isNaN(y));
	}
});

delete ES6.CheckObjectCoercible; // renamed in ES6 to RequireObjectCoercible

module.exports = ES6;

},{"./es5":6,"./helpers/assign":8,"./helpers/isFinite":9,"./helpers/isPrimitive":10,"./helpers/mod":11,"./helpers/sign":12,"es-to-primitive/es6":14,"function-bind":18,"is-regex":21}],8:[function(require,module,exports){
var has = Object.prototype.hasOwnProperty;
module.exports = Object.assign || function assign(target, source) {
	for (var key in source) {
		if (has.call(source, key)) {
			target[key] = source[key];
		}
	}
	return target;
};

},{}],9:[function(require,module,exports){
var $isNaN = Number.isNaN || function (a) { return a !== a; };

module.exports = Number.isFinite || function (x) { return typeof x === 'number' && !$isNaN(x) && x !== Infinity && x !== -Infinity; };

},{}],10:[function(require,module,exports){
module.exports = function isPrimitive(value) {
	return value === null || (typeof value !== 'function' && typeof value !== 'object');
};

},{}],11:[function(require,module,exports){
module.exports = function mod(number, modulo) {
	var remain = number % modulo;
	return Math.floor(remain >= 0 ? remain : remain + modulo);
};

},{}],12:[function(require,module,exports){
module.exports = function sign(number) {
	return number >= 0 ? 1 : -1;
};

},{}],13:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;

var isPrimitive = require('./helpers/isPrimitive');

var isCallable = require('is-callable');

// https://es5.github.io/#x8.12
var ES5internalSlots = {
	'[[DefaultValue]]': function (O, hint) {
		var actualHint = hint || (toStr.call(O) === '[object Date]' ? String : Number);

		if (actualHint === String || actualHint === Number) {
			var methods = actualHint === String ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
			var value, i;
			for (i = 0; i < methods.length; ++i) {
				if (isCallable(O[methods[i]])) {
					value = O[methods[i]]();
					if (isPrimitive(value)) {
						return value;
					}
				}
			}
			throw new TypeError('No default value');
		}
		throw new TypeError('invalid [[DefaultValue]] hint supplied');
	}
};

// https://es5.github.io/#x9
module.exports = function ToPrimitive(input, PreferredType) {
	if (isPrimitive(input)) {
		return input;
	}
	return ES5internalSlots['[[DefaultValue]]'](input, PreferredType);
};

},{"./helpers/isPrimitive":15,"is-callable":19}],14:[function(require,module,exports){
'use strict';

var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';

var isPrimitive = require('./helpers/isPrimitive');
var isCallable = require('is-callable');
var isDate = require('is-date-object');
var isSymbol = require('is-symbol');

var ordinaryToPrimitive = function OrdinaryToPrimitive(O, hint) {
	if (typeof O === 'undefined' || O === null) {
		throw new TypeError('Cannot call method on ' + O);
	}
	if (typeof hint !== 'string' || (hint !== 'number' && hint !== 'string')) {
		throw new TypeError('hint must be "string" or "number"');
	}
	var methodNames = hint === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
	var method, result, i;
	for (i = 0; i < methodNames.length; ++i) {
		method = O[methodNames[i]];
		if (isCallable(method)) {
			result = method.call(O);
			if (isPrimitive(result)) {
				return result;
			}
		}
	}
	throw new TypeError('No default value');
};

var GetMethod = function GetMethod(O, P) {
	var func = O[P];
	if (func !== null && typeof func !== 'undefined') {
		if (!isCallable(func)) {
			throw new TypeError(func + ' returned for property ' + P + ' of object ' + O + ' is not a function');
		}
		return func;
	}
};

// http://www.ecma-international.org/ecma-262/6.0/#sec-toprimitive
module.exports = function ToPrimitive(input, PreferredType) {
	if (isPrimitive(input)) {
		return input;
	}
	var hint = 'default';
	if (arguments.length > 1) {
		if (PreferredType === String) {
			hint = 'string';
		} else if (PreferredType === Number) {
			hint = 'number';
		}
	}

	var exoticToPrim;
	if (hasSymbols) {
		if (Symbol.toPrimitive) {
			exoticToPrim = GetMethod(input, Symbol.toPrimitive);
		} else if (isSymbol(input)) {
			exoticToPrim = Symbol.prototype.valueOf;
		}
	}
	if (typeof exoticToPrim !== 'undefined') {
		var result = exoticToPrim.call(input, hint);
		if (isPrimitive(result)) {
			return result;
		}
		throw new TypeError('unable to convert exotic object to primitive');
	}
	if (hint === 'default' && (isDate(input) || isSymbol(input))) {
		hint = 'string';
	}
	return ordinaryToPrimitive(input, hint === 'default' ? 'number' : hint);
};

},{"./helpers/isPrimitive":15,"is-callable":19,"is-date-object":20,"is-symbol":22}],15:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"dup":10}],16:[function(require,module,exports){

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


},{}],17:[function(require,module,exports){
var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],18:[function(require,module,exports){
var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":17}],19:[function(require,module,exports){
'use strict';

var fnToStr = Function.prototype.toString;

var constructorRegex = /^\s*class /;
var isES6ClassFn = function isES6ClassFn(value) {
	try {
		var fnStr = fnToStr.call(value);
		var singleStripped = fnStr.replace(/\/\/.*\n/g, '');
		var multiStripped = singleStripped.replace(/\/\*[.\s\S]*\*\//g, '');
		var spaceStripped = multiStripped.replace(/\n/mg, ' ').replace(/ {2}/g, ' ');
		return constructorRegex.test(spaceStripped);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionObject(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isCallable(value) {
	if (!value) { return false; }
	if (typeof value !== 'function' && typeof value !== 'object') { return false; }
	if (hasToStringTag) { return tryFunctionObject(value); }
	if (isES6ClassFn(value)) { return false; }
	var strClass = toStr.call(value);
	return strClass === fnClass || strClass === genClass;
};

},{}],20:[function(require,module,exports){
'use strict';

var getDay = Date.prototype.getDay;
var tryDateObject = function tryDateObject(value) {
	try {
		getDay.call(value);
		return true;
	} catch (e) {
		return false;
	}
};

var toStr = Object.prototype.toString;
var dateClass = '[object Date]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isDateObject(value) {
	if (typeof value !== 'object' || value === null) { return false; }
	return hasToStringTag ? tryDateObject(value) : toStr.call(value) === dateClass;
};

},{}],21:[function(require,module,exports){
'use strict';

var regexExec = RegExp.prototype.exec;
var tryRegexExec = function tryRegexExec(value) {
	try {
		regexExec.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var regexClass = '[object RegExp]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isRegex(value) {
	if (typeof value !== 'object') { return false; }
	return hasToStringTag ? tryRegexExec(value) : toStr.call(value) === regexClass;
};

},{}],22:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

if (hasSymbols) {
	var symToStr = Symbol.prototype.toString;
	var symStringRegex = /^Symbol\(.*\)$/;
	var isSymbolObject = function isSymbolObject(value) {
		if (typeof value.valueOf() !== 'symbol') { return false; }
		return symStringRegex.test(symToStr.call(value));
	};
	module.exports = function isSymbol(value) {
		if (typeof value === 'symbol') { return true; }
		if (toStr.call(value) !== '[object Symbol]') { return false; }
		try {
			return isSymbolObject(value);
		} catch (e) {
			return false;
		}
	};
} else {
	module.exports = function isSymbol(value) {
		// this environment does not support Symbols.
		return false;
	};
}

},{}],23:[function(require,module,exports){
'use strict';

// modified from https://github.com/es-shims/es5-shim
var has = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var slice = Array.prototype.slice;
var isArgs = require('./isArguments');
var hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString');
var hasProtoEnumBug = function () {}.propertyIsEnumerable('prototype');
var dontEnums = [
	'toString',
	'toLocaleString',
	'valueOf',
	'hasOwnProperty',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'constructor'
];
var equalsConstructorPrototype = function (o) {
	var ctor = o.constructor;
	return ctor && ctor.prototype === o;
};
var blacklistedKeys = {
	$console: true,
	$frame: true,
	$frameElement: true,
	$frames: true,
	$parent: true,
	$self: true,
	$webkitIndexedDB: true,
	$webkitStorageInfo: true,
	$window: true
};
var hasAutomationEqualityBug = (function () {
	/* global window */
	if (typeof window === 'undefined') { return false; }
	for (var k in window) {
		try {
			if (!blacklistedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
				try {
					equalsConstructorPrototype(window[k]);
				} catch (e) {
					return true;
				}
			}
		} catch (e) {
			return true;
		}
	}
	return false;
}());
var equalsConstructorPrototypeIfNotBuggy = function (o) {
	/* global window */
	if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
		return equalsConstructorPrototype(o);
	}
	try {
		return equalsConstructorPrototype(o);
	} catch (e) {
		return false;
	}
};

var keysShim = function keys(object) {
	var isObject = object !== null && typeof object === 'object';
	var isFunction = toStr.call(object) === '[object Function]';
	var isArguments = isArgs(object);
	var isString = isObject && toStr.call(object) === '[object String]';
	var theKeys = [];

	if (!isObject && !isFunction && !isArguments) {
		throw new TypeError('Object.keys called on a non-object');
	}

	var skipProto = hasProtoEnumBug && isFunction;
	if (isString && object.length > 0 && !has.call(object, 0)) {
		for (var i = 0; i < object.length; ++i) {
			theKeys.push(String(i));
		}
	}

	if (isArguments && object.length > 0) {
		for (var j = 0; j < object.length; ++j) {
			theKeys.push(String(j));
		}
	} else {
		for (var name in object) {
			if (!(skipProto && name === 'prototype') && has.call(object, name)) {
				theKeys.push(String(name));
			}
		}
	}

	if (hasDontEnumBug) {
		var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

		for (var k = 0; k < dontEnums.length; ++k) {
			if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
				theKeys.push(dontEnums[k]);
			}
		}
	}
	return theKeys;
};

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			return (Object.keys(arguments) || '').length === 2;
		}(1, 2));
		if (!keysWorksWithArguments) {
			var originalKeys = Object.keys;
			Object.keys = function keys(object) {
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				} else {
					return originalKeys(object);
				}
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;

},{"./isArguments":24}],24:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

},{}],25:[function(require,module,exports){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = function() {};

if ("production" !== 'production') {
  warning = function(condition, format, args) {
    var len = arguments.length;
    args = new Array(len > 2 ? len - 2 : 0);
    for (var key = 2; key < len; key++) {
      args[key - 2] = arguments[key];
    }
    if (format === undefined) {
      throw new Error(
        '`warning(condition, format, ...args)` requires a warning ' +
        'message argument'
      );
    }

    if (format.length < 10 || (/^[s\W]*$/).test(format)) {
      throw new Error(
        'The warning format should be able to uniquely identify this ' +
        'warning. Please, use a more descriptive format than: ' + format
      );
    }

    if (!condition) {
      var argIndex = 0;
      var message = 'Warning: ' +
        format.replace(/%s/g, function() {
          return args[argIndex++];
        });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch(x) {}
    }
  };
}

module.exports = warning;

},{}],26:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var _helpersIdentity = require('./helpers/identity');

var _helpersIdentity2 = _interopRequireDefault(_helpersIdentity);

var _helpersFlatten = require('./helpers/flatten');

var _helpersFlatten2 = _interopRequireDefault(_helpersFlatten);

var _helpersValues = require('./helpers/values');

var _helpersValues2 = _interopRequireDefault(_helpersValues);

exports['default'] = _react2['default'].createClass({
    displayName: 'Errors',

    propTypes: {
        errors: _react.PropTypes.arrayOf(_react.PropTypes.string),
        fieldErrors: _react.PropTypes.oneOfType([_react.PropTypes.array, _react.PropTypes.object]),
        additionalErrors: _react.PropTypes.arrayOf(_react.PropTypes.string),
        scoped: _react.PropTypes.bool,
        renderError: _react.PropTypes.func,
        className: _react.PropTypes.string
    },

    getDefaultProps: function getDefaultProps() {
        return {
            errors: [],
            additionalErrors: [],
            fieldErrors: [],
            scoped: false,
            renderError: _helpersIdentity2['default'],
            className: ''
        };
    },

    render: function render() {
        var _this = this;

        var _props = this.props;
        var errors = _props.errors;
        var additionalErrors = _props.additionalErrors;
        var scoped = _props.scoped;

        var fieldErrors = (0, _helpersFlatten2['default'])((0, _helpersValues2['default'])(this.props.fieldErrors)).filter(function (s) {
            return typeof s === 'string';
        });

        var allErrors = [].concat(scoped ? fieldErrors : errors).concat(additionalErrors);

        var className = this.props.className + ' errors';

        return _react2['default'].createElement(
            'ul',
            _extends({}, this.props, { className: className }),
            allErrors.map(function (error, i) {
                return _react2['default'].createElement(
                    'li',
                    { key: i },
                    ' ',
                    _this.props.renderError(error),
                    ' '
                );
            })
        );
    }
});
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./helpers/flatten":34,"./helpers/identity":35,"./helpers/values":40}],27:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var _helpersValues = require('./helpers/values');

var _helpersValues2 = _interopRequireDefault(_helpersValues);

var _fieldset = require('./fieldset');

var _fieldset2 = _interopRequireDefault(_fieldset);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

exports['default'] = _react2['default'].createClass({
    displayName: 'Fieldlist',

    propTypes: {
        errors: _react.PropTypes.arrayOf(_react.PropTypes.string),
        fieldErrors: _react.PropTypes.arrayOf(_react.PropTypes.object),
        name: _react.PropTypes.string.isRequired,
        children: _react.PropTypes.node
    },

    getInputs: function getInputs() {
        return {
            ref: this,
            refs: (0, _helpersValues2['default'])(this.refs.fieldset.getInputs().refs).filter(function (node) {
                return node.children && (0, _helpersValues2['default'])(node.children).length;
            })
        };
    },

    render: function render() {
        var _this = this;

        (0, _warning2['default'])(this.props.name, 'Fieldlist found without a name prop. The children of this component will behave eratically');

        var errors = this.props.errors || [];
        var fieldErrors = this.props.fieldErrors || [];

        // Overwrite errors and fieldErrors passed in here as fieldset expects
        // different errors than fieldlist. There is no need to pass them down
        return _react2['default'].createElement(
            _fieldset2['default'],
            _extends({}, this.props, {
                ref: 'fieldset',
                errors: [],
                fieldErrors: {} }),
            _react2['default'].Children.map(this.props.children, function (child, i) {
                return _react2['default'].createElement(
                    _fieldset2['default'],
                    { name: _this.props.name + i,
                        errors: errors,
                        fieldErrors: fieldErrors[i] },
                    child
                );
            })
        );
    }
});
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./fieldset":28,"./helpers/values":40,"warning":25}],28:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var _helpersCloneChildren = require('./helpers/cloneChildren');

var _helpersCloneChildren2 = _interopRequireDefault(_helpersCloneChildren);

var _helpersValues = require('./helpers/values');

var _helpersValues2 = _interopRequireDefault(_helpersValues);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _helpersTree = require('./helpers/tree');

var _helpersTree2 = _interopRequireDefault(_helpersTree);

exports['default'] = _react2['default'].createClass({
    displayName: 'Fieldset',

    propTypes: {
        errors: _react.PropTypes.arrayOf(_react.PropTypes.string),
        fieldErrors: _react.PropTypes.object,
        name: _react.PropTypes.string.isRequired,
        children: _react.PropTypes.node,
        onChange: _react.PropTypes.func,
        onSubmit: _react.PropTypes.func
    },

    getInputs: function getInputs() {
        return {
            ref: this,
            refs: (0, _helpersValues2['default'])(this.refs || {}).filter(function (ref) {
                return ref.getInputs || ref.getValue;
            }).map(function (ref) {
                return ref.getInputs ? ref.getInputs() : { ref: ref };
            }).map(function (x) {
                return (0, _helpersTree2['default'])(x.ref, x.refs);
            }).reduce(function (memo, node) {
                memo[node.value.props.name] = node;
                return memo;
            }, {})
        };
    },

    render: function render() {
        (0, _warning2['default'])(this.props.name, 'Fieldset found without a name prop. The children of this component will behave eratically');
        var errorsRule = (0, _helpersCloneChildren.createErrorsRule)(this.props.errors, this.props.fieldErrors);
        var formableRule = (0, _helpersCloneChildren.createFormableRule)(this.props.errors, this.props.fieldErrors, this.props.onSubmit, this.props.onChange);

        return _react2['default'].createElement(
            'div',
            this.props,
            (0, _helpersCloneChildren2['default'])([errorsRule, formableRule], this.props.children)
        );
    }
});
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./helpers/cloneChildren":31,"./helpers/tree":38,"./helpers/values":40,"warning":25}],29:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var _helpersUniq = require('./helpers/uniq');

var _helpersUniq2 = _interopRequireDefault(_helpersUniq);

var _helpersValues = require('./helpers/values');

var _helpersValues2 = _interopRequireDefault(_helpersValues);

var _helpersCloneChildren = require('./helpers/cloneChildren');

var _helpersCloneChildren2 = _interopRequireDefault(_helpersCloneChildren);

var _helpersTree = require('./helpers/tree');

var _helpersTree2 = _interopRequireDefault(_helpersTree);

var _helpersIdentity = require('./helpers/identity');

var _helpersIdentity2 = _interopRequireDefault(_helpersIdentity);

var getBlankForm = function getBlankForm() {
    return {
        valid: true,
        fieldValues: {},
        fieldErrors: {},
        errors: []
    };
};

exports.getBlankForm = getBlankForm;
var treeValue = function treeValue(tree) {
    return tree.map(function (value) {
        return value.getValue && value.getValue();
    }).extract();
};

var getValidators = function getValidators(ref) {
    var propValidators = ref && ref.props && ref.props.validators || [];
    var refValidators = ref && ref.validators || [];

    return [].concat(propValidators, refValidators);
};

exports['default'] = _react2['default'].createClass({
    displayName: 'Form',

    propTypes: {
        addValidationFieldErrors: _react.PropTypes.bool,

        // Handlers for your form callbacks. These will be called with the
        // current serialization of the form
        onSubmit: _react.PropTypes.func,
        onChange: _react.PropTypes.func,

        showErrorsOnSubmit: _react.PropTypes.bool,
        showErrorsOnChange: _react.PropTypes.bool,

        validators: _react.PropTypes.arrayOf(_react.PropTypes.func),

        // Default React children prop
        children: _react.PropTypes.node
    },

    getDefaultProps: function getDefaultProps() {
        return {
            onChange: function onChange() {},
            onSubmit: function onSubmit() {},
            showErrorsOnSubmit: true,
            showErrorsOnChange: false
        };
    },

    getInitialState: function getInitialState() {
        return {
            fieldErrors: {},
            errors: []
        };
    },

    serialize: function serialize() {
        var _this = this;

        // Build our list of children
        var refs = (0, _helpersValues2['default'])(this.refs || {}).filter(function (ref) {
            return ref && (ref.getInputs || ref.getValue);
        }).map(function (ref) {
            return ref.getInputs ? ref.getInputs() : { ref: ref };
        }).map(function (x) {
            return (0, _helpersTree2['default'])(x.ref, x.refs);
        }).reduce(function (memo, node) {
            memo[node.value.props.name] = node;
            return memo;
        }, {});

        // Make our tree which we will use for serialization and validation
        var formTree = (0, _helpersTree2['default'])(this, refs);

        // Calculate how many times we should serialize in the case of
        // cycles when addValidationFieldErrors is true. We do this by
        // counting how many nodes are in our tree
        var refLength = formTree.map(function () {
            return 1;
        }).reduce(function (a, b) {
            return a + b;
        }, 0);
        var iteration = 0;

        var form = getBlankForm();
        var oldForm = getBlankForm();

        do {
            // Keep a copy of the previous iteration of the form so we can
            // detect if the form is stable to exit early
            oldForm = _extends({}, form);

            // Gather our fieldValues from our tree
            form.fieldValues = treeValue(formTree);

            // Make a new temporary error tree. We will use this tree to
            // generate a nested object (fieldErrors) and again to reduce it
            // into an array (errors)
            var formTreeErrors = formTree.extend(function (tree) {
                var validators = getValidators(tree.value);
                var value = tree.value.getValue ? tree.value.getValue() : treeValue(tree);
                var fieldValues = form.fieldValues;
                var fieldErrors = _this.props.addValidationFieldErrors ? oldForm.fieldErrors : null;

                return validators.map(function (fn) {
                    return fn(value, fieldValues, fieldErrors);
                }).filter(_helpersIdentity2['default']);
            });

            form.fieldErrors = formTreeErrors.extract();
            form.errors = formTreeErrors.reduce(function (acc, val) {
                return acc.concat(val);
            }, []);

            iteration++;

            // If we don't need fieldErrors in our validators, we only need to
            // execute this do..while once. We need to loop because we don't have
            // explicit dependencies. We fake dependencies by making
            // an eventually stable tree.
        } while (this.props.addValidationFieldErrors && iteration < refLength && JSON.stringify(form) !== JSON.stringify(oldForm));

        // Update valid here so our formValidators can make use of it
        form.errors = (0, _helpersUniq2['default'])(form.errors.filter(_helpersIdentity2['default']));
        form.valid = !form.errors.length;

        return form;
    },

    onChange: function onChange() {
        this.props.onChange(this.serialize());
        if (this.props.showErrorsOnChange) {
            this.showFieldErrors();
        }
    },

    onSubmit: function onSubmit(event) {
        event && event.preventDefault && event.preventDefault();
        if (this.props.showErrorsOnSubmit) {
            this.showFieldErrors();
        }
        this.props.onSubmit(this.serialize());
    },

    onKeyDown: function onKeyDown(event) {
        if (event.key === 'Enter') {
            this.onSubmit(event);
        }
    },

    showFieldErrors: function showFieldErrors() {
        var _serialize = this.serialize();

        var fieldErrors = _serialize.fieldErrors;
        var errors = _serialize.errors;

        this.setState({ errors: errors, fieldErrors: fieldErrors });
        return errors;
    },

    clearFieldErrors: function clearFieldErrors() {
        this.setState({
            fieldErrors: {},
            errors: []
        });
    },

    render: function render() {
        var errorsRule = (0, _helpersCloneChildren.createErrorsRule)(this.state.errors, this.state.fieldErrors);
        var formableRule = (0, _helpersCloneChildren.createFormableRule)(this.state.errors, this.state.fieldErrors, this.onSubmit, this.onChange);

        return _react2['default'].createElement(
            'form',
            _extends({}, this.props, {
                ref: 'form',
                onSubmit: this.onSubmit,
                onChange: function () {},
                onKeyDown: this.onKeyDown }),
            (0, _helpersCloneChildren2['default'])([errorsRule, formableRule], this.props.children)
        );
    }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./helpers/cloneChildren":31,"./helpers/identity":35,"./helpers/tree":38,"./helpers/uniq":39,"./helpers/values":40}],30:[function(require,module,exports){
// Components
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _form = require('./form');

var _form2 = _interopRequireDefault(_form);

var _fieldset = require('./fieldset');

var _fieldset2 = _interopRequireDefault(_fieldset);

var _fieldlist = require('./fieldlist');

var _fieldlist2 = _interopRequireDefault(_fieldlist);

var _inputsInput = require('./inputs/input');

var _inputsInput2 = _interopRequireDefault(_inputsInput);

var _errors = require('./errors');

var _errors2 = _interopRequireDefault(_errors);

// Validators

var _validatorsRequired = require('./validators/required');

var _validatorsRequired2 = _interopRequireDefault(_validatorsRequired);

var _validatorsGreaterThan = require('./validators/greaterThan');

var _validatorsGreaterThan2 = _interopRequireDefault(_validatorsGreaterThan);

var _validatorsLessThan = require('./validators/lessThan');

var _validatorsLessThan2 = _interopRequireDefault(_validatorsLessThan);

var _validatorsMaxLength = require('./validators/maxLength');

var _validatorsMaxLength2 = _interopRequireDefault(_validatorsMaxLength);

var _validatorsMinLength = require('./validators/minLength');

var _validatorsMinLength2 = _interopRequireDefault(_validatorsMinLength);

var _validatorsTest = require('./validators/test');

var _validatorsTest2 = _interopRequireDefault(_validatorsTest);

var _validatorsEqualsField = require('./validators/equalsField');

var _validatorsEqualsField2 = _interopRequireDefault(_validatorsEqualsField);

var validators = { required: _validatorsRequired2['default'], greaterThan: _validatorsGreaterThan2['default'], lessThan: _validatorsLessThan2['default'], maxLength: _validatorsMaxLength2['default'], minLength: _validatorsMinLength2['default'], test: _validatorsTest2['default'], equalsField: _validatorsEqualsField2['default'] };

exports.Form = _form2['default'];
exports.getBlankForm = _form.getBlankForm;
exports.Fieldset = _fieldset2['default'];
exports.Fieldlist = _fieldlist2['default'];
exports.Input = _inputsInput2['default'];
exports.Errors = _errors2['default'];
exports.validators = validators;
exports['default'] = _form2['default'];

},{"./errors":26,"./fieldlist":27,"./fieldset":28,"./form":29,"./inputs/input":41,"./validators/equalsField":42,"./validators/greaterThan":43,"./validators/lessThan":44,"./validators/maxLength":45,"./validators/minLength":46,"./validators/required":47,"./validators/test":48}],31:[function(require,module,exports){
(function (global){
/*eslint func-style:0*/
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.createErrorsRule = createErrorsRule;
exports.createFormableRule = createFormableRule;
exports['default'] = cloneChildren;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var _identity = require('./identity');

var _identity2 = _interopRequireDefault(_identity);

var _compose = require('./compose');

var _compose2 = _interopRequireDefault(_compose);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

// IE compatibility
require('array.prototype.find').shim();

/**
 * Rule for cloning something at leaf level like some text
 */
var leafRule = {
    predicate: function predicate(child) {
        return typeof child !== 'object' || child === null;
    },
    clone: _identity2['default']
};

/**
 * Allows default recursion into an element that has children.
 *
 * @param {array} rules on how to clone individual elements
 * @returns {Object} rule for cloning recursively
 */
function createRecursiveRule(rules) {
    return {
        predicate: function predicate() {
            return true;
        },
        clone: function clone(child, childNames) {
            return _react2['default'].cloneElement(child, {}, cloneChildren(rules, child.props && child.props.children, childNames));
        }
    };
}

/**
 * A common function for cloning Errors element that takes care of injecting
 * required error data
 *
 * @param {array} errors of the form
 * @param {Object} fieldErrors of the form
 * @return {Object} rule for cloning Errors element
 */

function createErrorsRule() {
    var errors = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    var fieldErrors = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return {
        predicate: function predicate(child) {
            return child.type && child.type.displayName === 'Errors';
        },
        clone: function clone(child) {
            return _react2['default'].cloneElement(child, {
                errors: errors,
                fieldErrors: fieldErrors
            }, child.props && child.props.children);
        }
    };
}

function combineListsIfLists() {
    var combined = [];

    for (var _len = arguments.length, lists = Array(_len), _key = 0; _key < _len; _key++) {
        lists[_key] = arguments[_key];
    }

    lists.forEach(function (list) {
        if (list && list.length) {
            combined.push.apply(combined, _toConsumableArray(list));
        }
    });
    return combined;
}

/*
 * Get extra properties for something we are going to weave our formable magic into.
 */
function getFormableComponentProperties(errors, fieldErrors, onSubmit, onChange) {
    return function (child, childNames) {
        (0, _warning2['default'])(!child.ref, 'Attempting to attach ref "' + child.ref + '" to "' + child.props.name + '" will be bad for your health');
        (0, _warning2['default'])(childNames.indexOf(child.props.name) === -1, 'Duplicate name "' + child.props.name + '" found. Duplicate fields will be ignored');
        childNames.push(child.props.name);

        return {
            ref: child.ref || child.props.name,
            onChange: (0, _compose2['default'])(onChange, child.props.onChange || _identity2['default']),
            onSubmit: (0, _compose2['default'])(onSubmit, child.props.onSubmit || _identity2['default']),
            errors: errors,
            fieldErrors: combineListsIfLists(child.props.fieldErrors, fieldErrors[child.props.name])
        };
    };
}

/*
 * Standard cloning rule for something react-formable
 */

function createFormableRule() {
    var errors = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    var fieldErrors = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var onSubmit = arguments.length <= 2 || arguments[2] === undefined ? _identity2['default'] : arguments[2];
    var onChange = arguments.length <= 3 || arguments[3] === undefined ? _identity2['default'] : arguments[3];

    return {
        predicate: function predicate(child) {
            return child.props && child.props.name;
        },
        clone: function clone(child, childNames) {
            return _react2['default'].cloneElement(child, getFormableComponentProperties(errors, fieldErrors, onSubmit, onChange)(child, childNames), child.props && child.props.children);
        }
    };
}

/**
 * Clones a child subtree using the supplied rules which are composed of predicates
 * and clone instructions.
 *
 * @param  {array} rules used to predicate and clone
 * @param  {Function} children The children to iterate over
 * @param  {array=} childNames optionally and ONLY supplied for internal recursion
 * @return {Object} The cloned children
 */

function cloneChildren(rules, children) {
    var childNames = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    if (children) {
        var _ret = (function () {
            var cloneRules = [leafRule].concat(_toConsumableArray(rules), [createRecursiveRule(rules)]);
            var clones = _react2['default'].Children.map(children, function (child) {
                // find first rule that passes and use it to clone
                return cloneRules.find(function (rule) {
                    return rule.predicate(child);
                }).clone(child, childNames);
            });

            return {
                v: _react2['default'].Children.count(clones) == 1 ? clones[0] : clones
            };
        })();

        if (typeof _ret === 'object') return _ret.v;
    }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./compose":32,"./identity":35,"array.prototype.find":2,"warning":25}],32:[function(require,module,exports){
/*eslint func-style:0*/

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = compose;

function compose(f2, f1) {
    return function () {
        return f2(f1.apply(undefined, arguments));
    };
}

module.exports = exports["default"];

},{}],33:[function(require,module,exports){
/*eslint func-style:0*/
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = deepFind;

function deepFind(obj, path) {
    var paths = path.split('.');
    var current = obj,
        i = undefined;

    for (i = 0; i < paths.length; ++i) {
        if (current[paths[i]] == undefined) {
            return undefined;
        }
        current = current[paths[i]];
    }
    return current;
}

module.exports = exports['default'];

},{}],34:[function(require,module,exports){
/*eslint func-style:0*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = flatten;

function flatten(arr) {
    return [].concat.apply([], arr);
}

module.exports = exports["default"];

},{}],35:[function(require,module,exports){
/*eslint func-style:0*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = identity;

function identity(x) {
    return x;
}

module.exports = exports["default"];

},{}],36:[function(require,module,exports){
/*eslint func-style:0*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = isNil;

function isNil(x) {
    return x == null;
}

module.exports = exports["default"];

},{}],37:[function(require,module,exports){
/*eslint func-style:0*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = mapObj;

function mapObj(fn, obj) {
    var ret = {};

    for (var key in obj) {
        ret[key] = fn(obj[key], key);
    }
    return ret;
}

module.exports = exports["default"];

},{}],38:[function(require,module,exports){
/*eslint func-style:0*/
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = tree;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mapObj = require('./mapObj');

var _mapObj2 = _interopRequireDefault(_mapObj);

var _values = require('./values');

var _values2 = _interopRequireDefault(_values);

/**
 * map
 *
 * Not your traditional map which is probably bad. This version is a noop when
 * its data is null. Defaults to implemented map and also allows mapping over
 * objects
 *
 * map :: (a -> b) -> [a] | {a} -> [a] | {b}
 *
 * @param {Function} fn Callback that transforms a value
 * @param {a|Array|Object} data the information to map over
 * @return {a|Array|Object} Returns whatever the data value is transformed
 */
function _map(fn) {
    return function (data) {
        if (!data) return;

        if (data.map) return data.map(fn);

        if (typeof data === 'object') {
            return (0, _mapObj2['default'])(fn, data);
        }
    };
}

function tree(value, children) {
    return {
        // The children of the tree
        value: value,

        // The value which we will map over
        children: children,

        // Map over each value in the tree reciving and modifying value
        map: function map(fn) {
            return tree(fn(value), _map(_map(fn))(children));
        },

        // Get the value of the (sub)tree as an object / array
        extract: function extract() {
            return children ? _map(function (x) {
                return x.extract();
            })(children) : value;
        },

        // Create a new tree by maping over the full tree
        // fn takes in the full tree value. Whatever fn returns gets
        // stored within the value of the node. Recuses down the tree
        extend: function extend(fn) {
            return tree(fn(tree(value, children)), _map(function (x) {
                return x.extend(fn);
            })(children));
        },

        // Boil down the tree into one value, node by node
        // fn recives the value value for each node
        reduce: function reduce(fn, acc) {
            return (0, _values2['default'])(children).reduce(function (memo, node) {
                return node.reduce(fn, memo);
            }, fn(acc, value));
        }
    };
}

module.exports = exports['default'];

},{"./mapObj":37,"./values":40}],39:[function(require,module,exports){
/*eslint func-style:0*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = uniq;

function uniq(arr) {
    return arr.reduce(function (memo, item) {
        return memo.indexOf(item) === -1 ? memo.concat(item) : memo;
    }, []);
}

module.exports = exports["default"];

},{}],40:[function(require,module,exports){
/*eslint func-style:0*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = values;

function values(obj) {
    var ret = [];

    for (var key in obj) {
        ret = ret.concat(obj[key]);
    }
    return ret;
}

module.exports = exports["default"];

},{}],41:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var identity = function identity(x) {
    return x;
};

exports['default'] = _react2['default'].createClass({
    displayName: 'input',

    propTypes: {
        fieldErrors: _react.PropTypes.arrayOf(_react.PropTypes.string),
        validateOnBlur: _react.PropTypes.bool,
        onChange: _react.PropTypes.func,
        onSubmit: _react.PropTypes.func,
        className: _react.PropTypes.string
    },

    getDefaultProps: function getDefaultProps() {
        return {
            onChange: identity,
            onSubmit: identity,
            className: ''
        };
    },

    getValue: function getValue() {
        return this.refs.input.value;
    },

    onChange: function onChange(e) {
        if (!this.props.validateOnBlur) {
            this.props.onChange(e);
        }
    },

    onBlur: function onBlur() {
        if (this.props.validateOnBlur) {
            this.props.onChange();
        }
    },

    render: function render() {
        var hasError = this.props.fieldErrors && this.props.fieldErrors.length;
        var className = this.props.className + ' ' + (hasError ? 'error' : '');

        return _react2['default'].createElement('input', _extends({}, this.props, {
            className: className,
            onChange: this.onChange,
            onBlur: this.onBlur,
            ref: 'input' }));
    }
});
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],42:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = required;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersDeepFind = require('../helpers/deepFind');

var _helpersDeepFind2 = _interopRequireDefault(_helpersDeepFind);

/*eslint func-style:0*/

function required(equalsField, errorMessage) {
    return function (value, fieldValues) {
        if ((0, _helpersDeepFind2['default'])(fieldValues, equalsField) !== value) {
            return errorMessage;
        }
    };
}

module.exports = exports['default'];

},{"../helpers/deepFind":33}],43:[function(require,module,exports){
/*eslint func-style:0*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = greaterThan;

function greaterThan(greaterThanValue, errorMessage) {
    return function (value) {
        if (parseFloat(value) <= greaterThanValue) {
            return errorMessage;
        }
    };
}

module.exports = exports["default"];

},{}],44:[function(require,module,exports){
/*eslint func-style:0*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = lessThan;

function lessThan(lessThanValue, errorMessage) {
    return function (value) {
        if (parseFloat(value) >= lessThanValue) {
            return errorMessage;
        }
    };
}

module.exports = exports["default"];

},{}],45:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = maxLength;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersIsNil = require('../helpers/isNil');

var _helpersIsNil2 = _interopRequireDefault(_helpersIsNil);

/*eslint func-style:0*/

function maxLength(maxLength, errorMessage) {
    return function (value) {
        if ((0, _helpersIsNil2['default'])(value) || value.length > maxLength) {
            return errorMessage;
        }
    };
}

module.exports = exports['default'];

},{"../helpers/isNil":36}],46:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = minLength;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersIsNil = require('../helpers/isNil');

var _helpersIsNil2 = _interopRequireDefault(_helpersIsNil);

/*eslint func-style:0*/

function minLength(minLength, errorMessage) {
    return function (value) {
        if ((0, _helpersIsNil2['default'])(value) || value.length < minLength) {
            return errorMessage;
        }
    };
}

module.exports = exports['default'];

},{"../helpers/isNil":36}],47:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = required;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersIsNil = require('../helpers/isNil');

var _helpersIsNil2 = _interopRequireDefault(_helpersIsNil);

function emptyString(value) {
    return !value.trim().length;
}

function emptyObject(value) {
    return !Object.keys(value).length;
}

/*eslint func-style:0*/

function required(errorMessage) {
    return function (value) {
        if ((0, _helpersIsNil2['default'])(value)) {
            return errorMessage;
        }
        if (typeof value === 'string' && emptyString(value)) {
            return errorMessage;
        } else if (typeof value === 'object' && emptyObject(value)) {
            return errorMessage;
        }
    };
}

module.exports = exports['default'];

},{"../helpers/isNil":36}],48:[function(require,module,exports){
/*eslint func-style:0*/
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = test;

function test(regexp, errorMessage) {
    return function (value) {
        var r = regexp && regexp.test ? regexp : new RegExp(regexp);

        if (!r.test(value)) {
            return errorMessage;
        }
    };
}

module.exports = exports["default"];

},{}]},{},[30])(30)
});