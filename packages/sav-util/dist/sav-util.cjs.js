/*!
 * sav-util v0.0.1
 * (c) 2016 jetiny 86287344@qq.com
 * Release under the ISC License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function toStringType(val) {
    return Object.prototype.toString.call(val).slice(8, -1)
}

var isArray = Array.isArray;

function isBoolean(arg) {
	return typeof arg === 'boolean'
}

function isString(arg) {
	return typeof arg === 'string'
}

function isFunction(arg) {
	return typeof arg === 'function'
}

function isObject(arg) {
	return (toStringType(arg) == 'Object') && (arg !== null)
}

function isNumber(arg) {
    return typeof arg === 'number' && !isNaN(arg)
}

function isInteger(arg) {
    return isNumber(arg) && parseInt(arg) === arg
}

function isUndefined (arg) {
    return arg === undefined
}

function isNull (arg) {
    return arg === null
}

function isNan (arg) {
    return typeof arg === 'number' && isNaN(arg)
}

function isRegExp (arg) {
    return toStringType(arg) == 'RegExp'
}

function isDate (arg) {
    return toStringType(arg) == 'Date'
}

function typeValue (arg) {
    if (isNan(arg))
        { return 'NaN' }
    switch (arg) {
        case undefined:
            return 'Undefined'
        case null:
            return 'Null'
        default:
            return toStringType(arg)
    }
}

var isInt = isInteger;
function isUint (arg) {
    return isInteger(arg) && arg >= 0;
}

var Test = function Test() {
	this.test();
};
Test.prototype.test = function test () {

};

var A = (function (Test) {
	function A () {
		Test.apply(this, arguments);
	}

	if ( Test ) A.__proto__ = Test;
	A.prototype = Object.create( Test && Test.prototype );
	A.prototype.constructor = A;

	A.prototype.test = function test () {
		console.log('a');
		// Test.prototype.test.call(this)
	};

	return A;
}(Test));

new A();

exports.isArray = isArray;
exports.isBoolean = isBoolean;
exports.isString = isString;
exports.isFunction = isFunction;
exports.isObject = isObject;
exports.isNumber = isNumber;
exports.isInteger = isInteger;
exports.isUndefined = isUndefined;
exports.isNull = isNull;
exports.isNan = isNan;
exports.isRegExp = isRegExp;
exports.isDate = isDate;
exports.typeValue = typeValue;
exports.isInt = isInt;
exports.isUint = isUint;
