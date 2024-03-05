"use strict";

const globals = require("../../utils/globals.js");
module.exports = {
    ...globals.es2024,

    // Missing ES3:
    decodeURI: undefined,
    encodeURI: undefined,
    escape: undefined,
    EvalError: undefined,
    isPrototypeOf: undefined,
    propertyIsEnumerable: undefined,
    RangeError: undefined,
    toLocaleString: undefined,
    toString: undefined,
    unescape: undefined,
    URIError: undefined,
    valueOf: undefined,

    // Missing ES2015:
    Map: undefined,
    Proxy: undefined,
    Reflect: undefined,
    Set: undefined,
    Symbol: undefined,
    WeakMap: undefined,
    WeakSet: undefined,

    // Missing ES2017:
    Atomics: undefined,
    SharedArrayBuffer: undefined,

    // Missing ES2020:
    BigInt: undefined,
    BigInt64Array: undefined,
    BigUint64Array: undefined,

    // Missing ES2021:
    AggregateError: undefined,
    FinalizationRegistry: undefined,
    WeakRef: undefined,

}