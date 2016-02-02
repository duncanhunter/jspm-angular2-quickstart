'use strict';var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
var test_injector_1 = require('./test_injector');
var utils_1 = require('./utils');
var test_injector_2 = require('./test_injector');
exports.inject = test_injector_2.inject;
var matchers_1 = require('./matchers');
exports.expect = matchers_1.expect;
exports.proxy = function (t) { return t; };
var _global = (typeof window === 'undefined' ? lang_1.global : window);
exports.afterEach = _global.afterEach;
/**
 * Injectable completer that allows signaling completion of an asynchronous test. Used internally.
 */
var AsyncTestCompleter = (function () {
    function AsyncTestCompleter(_done) {
        this._done = _done;
    }
    AsyncTestCompleter.prototype.done = function () { this._done(); };
    return AsyncTestCompleter;
})();
exports.AsyncTestCompleter = AsyncTestCompleter;
var jsmBeforeEach = _global.beforeEach;
var jsmDescribe = _global.describe;
var jsmDDescribe = _global.fdescribe;
var jsmXDescribe = _global.xdescribe;
var jsmIt = _global.it;
var jsmIIt = _global.fit;
var jsmXIt = _global.xit;
var runnerStack = [];
var inIt = false;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 500;
var globalTimeOut = utils_1.browserDetection.isSlow ? 3000 : jasmine.DEFAULT_TIMEOUT_INTERVAL;
var testInjector = test_injector_1.getTestInjector();
/**
 * Mechanism to run `beforeEach()` functions of Angular tests.
 *
 * Note: Jasmine own `beforeEach` is used by this library to handle DI providers.
 */
var BeforeEachRunner = (function () {
    function BeforeEachRunner(_parent) {
        this._parent = _parent;
        this._fns = [];
    }
    BeforeEachRunner.prototype.beforeEach = function (fn) { this._fns.push(fn); };
    BeforeEachRunner.prototype.run = function () {
        if (this._parent)
            this._parent.run();
        this._fns.forEach(function (fn) {
            return lang_1.isFunction(fn) ? fn() :
                (testInjector.execute(fn));
        });
    };
    return BeforeEachRunner;
})();
// Reset the test providers before each test
jsmBeforeEach(function () { testInjector.reset(); });
function _describe(jsmFn) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var parentRunner = runnerStack.length === 0 ? null : runnerStack[runnerStack.length - 1];
    var runner = new BeforeEachRunner(parentRunner);
    runnerStack.push(runner);
    var suite = jsmFn.apply(void 0, args);
    runnerStack.pop();
    return suite;
}
function describe() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    return _describe.apply(void 0, [jsmDescribe].concat(args));
}
exports.describe = describe;
function ddescribe() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    return _describe.apply(void 0, [jsmDDescribe].concat(args));
}
exports.ddescribe = ddescribe;
function xdescribe() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    return _describe.apply(void 0, [jsmXDescribe].concat(args));
}
exports.xdescribe = xdescribe;
function beforeEach(fn) {
    if (runnerStack.length > 0) {
        // Inside a describe block, beforeEach() uses a BeforeEachRunner
        runnerStack[runnerStack.length - 1].beforeEach(fn);
    }
    else {
        // Top level beforeEach() are delegated to jasmine
        jsmBeforeEach(fn);
    }
}
exports.beforeEach = beforeEach;
/**
 * Allows overriding default providers defined in test_injector.js.
 *
 * The given function must return a list of DI providers.
 *
 * Example:
 *
 *   beforeEachProviders(() => [
 *     provide(Compiler, {useClass: MockCompiler}),
 *     provide(SomeToken, {useValue: myValue}),
 *   ]);
 */
function beforeEachProviders(fn) {
    jsmBeforeEach(function () {
        var providers = fn();
        if (!providers)
            return;
        testInjector.addProviders(providers);
    });
}
exports.beforeEachProviders = beforeEachProviders;
/**
 * @deprecated
 */
function beforeEachBindings(fn) {
    beforeEachProviders(fn);
}
exports.beforeEachBindings = beforeEachBindings;
function _it(jsmFn, name, testFn, testTimeOut) {
    var runner = runnerStack[runnerStack.length - 1];
    var timeOut = lang_1.Math.max(globalTimeOut, testTimeOut);
    if (testFn instanceof test_injector_1.FunctionWithParamTokens) {
        // The test case uses inject(). ie `it('test', inject([AsyncTestCompleter], (async) => { ...
        // }));`
        if (testFn.hasToken(AsyncTestCompleter)) {
            jsmFn(name, function (done) {
                var completerProvider = core_1.provide(AsyncTestCompleter, {
                    useFactory: function () {
                        // Mark the test as async when an AsyncTestCompleter is injected in an it()
                        if (!inIt)
                            throw new Error('AsyncTestCompleter can only be injected in an "it()"');
                        return new AsyncTestCompleter(done);
                    }
                });
                testInjector.addProviders([completerProvider]);
                runner.run();
                inIt = true;
                testInjector.execute(testFn);
                inIt = false;
            }, timeOut);
        }
        else {
            jsmFn(name, function () {
                runner.run();
                testInjector.execute(testFn);
            }, timeOut);
        }
    }
    else {
        // The test case doesn't use inject(). ie `it('test', (done) => { ... }));`
        if (testFn.length === 0) {
            jsmFn(name, function () {
                runner.run();
                testFn();
            }, timeOut);
        }
        else {
            jsmFn(name, function (done) {
                runner.run();
                testFn(done);
            }, timeOut);
        }
    }
}
function it(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIt, name, fn, timeOut);
}
exports.it = it;
function xit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmXIt, name, fn, timeOut);
}
exports.xit = xit;
function iit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIIt, name, fn, timeOut);
}
exports.iit = iit;
var SpyObject = (function () {
    function SpyObject(type) {
        if (type === void 0) { type = null; }
        if (type) {
            for (var prop in type.prototype) {
                var m = null;
                try {
                    m = type.prototype[prop];
                }
                catch (e) {
                }
                if (typeof m === 'function') {
                    this.spy(prop);
                }
            }
        }
    }
    // Noop so that SpyObject has the same interface as in Dart
    SpyObject.prototype.noSuchMethod = function (args) { };
    SpyObject.prototype.spy = function (name) {
        if (!this[name]) {
            this[name] = this._createGuinnessCompatibleSpy(name);
        }
        return this[name];
    };
    SpyObject.prototype.prop = function (name, value) { this[name] = value; };
    SpyObject.stub = function (object, config, overrides) {
        if (object === void 0) { object = null; }
        if (config === void 0) { config = null; }
        if (overrides === void 0) { overrides = null; }
        if (!(object instanceof SpyObject)) {
            overrides = config;
            config = object;
            object = new SpyObject();
        }
        var m = collection_1.StringMapWrapper.merge(config, overrides);
        collection_1.StringMapWrapper.forEach(m, function (value, key) { object.spy(key).andReturn(value); });
        return object;
    };
    /** @internal */
    SpyObject.prototype._createGuinnessCompatibleSpy = function (name) {
        var newSpy = jasmine.createSpy(name);
        newSpy.andCallFake = newSpy.and.callFake;
        newSpy.andReturn = newSpy.and.returnValue;
        newSpy.reset = newSpy.calls.reset;
        // revisit return null here (previously needed for rtts_assert).
        newSpy.and.returnValue(null);
        return newSpy;
    };
    return SpyObject;
})();
exports.SpyObject = SpyObject;
function isInInnerZone() {
    return lang_1.global.zone._innerZone === true;
}
exports.isInInnerZone = isInInnerZone;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ19pbnRlcm5hbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RpbmdfaW50ZXJuYWwudHMiXSwibmFtZXMiOlsiQXN5bmNUZXN0Q29tcGxldGVyIiwiQXN5bmNUZXN0Q29tcGxldGVyLmNvbnN0cnVjdG9yIiwiQXN5bmNUZXN0Q29tcGxldGVyLmRvbmUiLCJCZWZvcmVFYWNoUnVubmVyIiwiQmVmb3JlRWFjaFJ1bm5lci5jb25zdHJ1Y3RvciIsIkJlZm9yZUVhY2hSdW5uZXIuYmVmb3JlRWFjaCIsIkJlZm9yZUVhY2hSdW5uZXIucnVuIiwiX2Rlc2NyaWJlIiwiZGVzY3JpYmUiLCJkZGVzY3JpYmUiLCJ4ZGVzY3JpYmUiLCJiZWZvcmVFYWNoIiwiYmVmb3JlRWFjaFByb3ZpZGVycyIsImJlZm9yZUVhY2hCaW5kaW5ncyIsIl9pdCIsIml0IiwieGl0IiwiaWl0IiwiU3B5T2JqZWN0IiwiU3B5T2JqZWN0LmNvbnN0cnVjdG9yIiwiU3B5T2JqZWN0Lm5vU3VjaE1ldGhvZCIsIlNweU9iamVjdC5zcHkiLCJTcHlPYmplY3QucHJvcCIsIlNweU9iamVjdC5zdHViIiwiU3B5T2JqZWN0Ll9jcmVhdGVHdWlubmVzc0NvbXBhdGlibGVTcHkiLCJpc0luSW5uZXJab25lIl0sIm1hcHBpbmdzIjoiQUFDQSwyQkFBK0IsZ0NBQWdDLENBQUMsQ0FBQTtBQUNoRSxxQkFBdUMsMEJBQTBCLENBQUMsQ0FBQTtBQUdsRSxxQkFBc0IsZUFBZSxDQUFDLENBQUE7QUFFdEMsOEJBQTZFLGlCQUFpQixDQUFDLENBQUE7QUFDL0Ysc0JBQStCLFNBQVMsQ0FBQyxDQUFBO0FBRXpDLDhCQUFxQixpQkFBaUIsQ0FBQztBQUEvQix3Q0FBK0I7QUFFdkMseUJBQWlDLFlBQVksQ0FBQztBQUF0QyxtQ0FBc0M7QUFFbkMsYUFBSyxHQUFtQixVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsRUFBRCxDQUFDLENBQUM7QUFFNUMsSUFBSSxP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QUNBO1FBQ3ZDQSxnRUFBZ0VBO1FBQ2hFQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUM3QkEsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7SUFDaEJBLENBQUNBO0lBQ0hOLGdCQUFDQTtBQUFEQSxDQUFDQSxBQXJERCxJQXFEQztBQXJEWSxpQkFBUyxZQXFEckIsQ0FBQTtBQUVEO0lBQ0VPLE1BQU1BLENBQWNBLGFBQU1BLENBQUNBLElBQUtBLENBQUNBLFVBQVVBLEtBQUtBLElBQUlBLENBQUNBO0FBQ3ZEQSxDQUFDQTtBQUZlLHFCQUFhLGdCQUU1QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtnbG9iYWwsIGlzRnVuY3Rpb24sIE1hdGh9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge05nWm9uZVpvbmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZSc7XG5cbmltcG9ydCB7cHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCB7VGVzdEluamVjdG9yLCBnZXRUZXN0SW5qZWN0b3IsIEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zLCBpbmplY3R9IGZyb20gJy4vdGVzdF9pbmplY3Rvcic7XG5pbXBvcnQge2Jyb3dzZXJEZXRlY3Rpb259IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQge2luamVjdH0gZnJvbSAnLi90ZXN0X2luamVjdG9yJztcblxuZXhwb3J0IHtleHBlY3QsIE5nTWF0Y2hlcnN9IGZyb20gJy4vbWF0Y2hlcnMnO1xuXG5leHBvcnQgdmFyIHByb3h5OiBDbGFzc0RlY29yYXRvciA9ICh0KSA9PiB0O1xuXG52YXIgX2dsb2JhbDogamFzbWluZS5HbG9iYWxQb2xsdXRlciA9IDxhbnk+KHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogd2luZG93KTtcblxuZXhwb3J0IHZhciBhZnRlckVhY2g6IEZ1bmN0aW9uID0gX2dsb2JhbC5hZnRlckVhY2g7XG5cbmV4cG9ydCB0eXBlIFN5bmNUZXN0Rm4gPSAoKSA9PiB2b2lkO1xudHlwZSBBc3luY1Rlc3RGbiA9IChkb25lOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xudHlwZSBBbnlUZXN0Rm4gPSBTeW5jVGVzdEZuIHwgQXN5bmNUZXN0Rm47XG5cbi8qKlxuICogSW5qZWN0YWJsZSBjb21wbGV0ZXIgdGhhdCBhbGxvd3Mgc2lnbmFsaW5nIGNvbXBsZXRpb24gb2YgYW4gYXN5bmNocm9ub3VzIHRlc3QuIFVzZWQgaW50ZXJuYWxseS5cbiAqL1xuZXhwb3J0IGNsYXNzIEFzeW5jVGVzdENvbXBsZXRlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2RvbmU6IEZ1bmN0aW9uKSB7fVxuXG4gIGRvbmUoKTogdm9pZCB7IHRoaXMuX2RvbmUoKTsgfVxufVxuXG52YXIganNtQmVmb3JlRWFjaCA9IF9nbG9iYWwuYmVmb3JlRWFjaDtcbnZhciBqc21EZXNjcmliZSA9IF9nbG9iYWwuZGVzY3JpYmU7XG52YXIganNtRERlc2NyaWJlID0gX2dsb2JhbC5mZGVzY3JpYmU7XG52YXIganNtWERlc2NyaWJlID0gX2dsb2JhbC54ZGVzY3JpYmU7XG52YXIganNtSXQgPSBfZ2xvYmFsLml0O1xudmFyIGpzbUlJdCA9IF9nbG9iYWwuZml0O1xudmFyIGpzbVhJdCA9IF9nbG9iYWwueGl0O1xuXG52YXIgcnVubmVyU3RhY2sgPSBbXTtcbnZhciBpbkl0ID0gZmFsc2U7XG5qYXNtaW5lLkRFRkFVTFRfVElNRU9VVF9JTlRFUlZBTCA9IDUwMDtcbnZhciBnbG9iYWxUaW1lT3V0ID0gYnJvd3NlckRldGVjdGlvbi5pc1Nsb3cgPyAzMDAwIDogamFzbWluZS5ERUZBVUxUX1RJTUVPVVRfSU5URVJWQUw7XG5cbnZhciB0ZXN0SW5qZWN0b3IgPSBnZXRUZXN0SW5qZWN0b3IoKTtcblxuLyoqXG4gKiBNZWNoYW5pc20gdG8gcnVuIGBiZWZvcmVFYWNoKClgIGZ1bmN0aW9ucyBvZiBBbmd1bGFyIHRlc3RzLlxuICpcbiAqIE5vdGU6IEphc21pbmUgb3duIGBiZWZvcmVFYWNoYCBpcyB1c2VkIGJ5IHRoaXMgbGlicmFyeSB0byBoYW5kbGUgREkgcHJvdmlkZXJzLlxuICovXG5jbGFzcyBCZWZvcmVFYWNoUnVubmVyIHtcbiAgcHJpdmF0ZSBfZm5zOiBBcnJheTxGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IFN5bmNUZXN0Rm4+ID0gW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGFyZW50OiBCZWZvcmVFYWNoUnVubmVyKSB7fVxuXG4gIGJlZm9yZUVhY2goZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgU3luY1Rlc3RGbik6IHZvaWQgeyB0aGlzLl9mbnMucHVzaChmbik7IH1cblxuICBydW4oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3BhcmVudCkgdGhpcy5fcGFyZW50LnJ1bigpO1xuICAgIHRoaXMuX2Zucy5mb3JFYWNoKChmbikgPT4ge1xuICAgICAgcmV0dXJuIGlzRnVuY3Rpb24oZm4pID8gKDxTeW5jVGVzdEZuPmZuKSgpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0ZXN0SW5qZWN0b3IuZXhlY3V0ZSg8RnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnM+Zm4pKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vLyBSZXNldCB0aGUgdGVzdCBwcm92aWRlcnMgYmVmb3JlIGVhY2ggdGVzdFxuanNtQmVmb3JlRWFjaCgoKSA9PiB7IHRlc3RJbmplY3Rvci5yZXNldCgpOyB9KTtcblxuZnVuY3Rpb24gX2Rlc2NyaWJlKGpzbUZuLCAuLi5hcmdzKSB7XG4gIHZhciBwYXJlbnRSdW5uZXIgPSBydW5uZXJTdGFjay5sZW5ndGggPT09IDAgPyBudWxsIDogcnVubmVyU3RhY2tbcnVubmVyU3RhY2subGVuZ3RoIC0gMV07XG4gIHZhciBydW5uZXIgPSBuZXcgQmVmb3JlRWFjaFJ1bm5lcihwYXJlbnRSdW5uZXIpO1xuICBydW5uZXJTdGFjay5wdXNoKHJ1bm5lcik7XG4gIHZhciBzdWl0ZSA9IGpzbUZuKC4uLmFyZ3MpO1xuICBydW5uZXJTdGFjay5wb3AoKTtcbiAgcmV0dXJuIHN1aXRlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVzY3JpYmUoLi4uYXJncyk6IHZvaWQge1xuICByZXR1cm4gX2Rlc2NyaWJlKGpzbURlc2NyaWJlLCAuLi5hcmdzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRkZXNjcmliZSguLi5hcmdzKTogdm9pZCB7XG4gIHJldHVybiBfZGVzY3JpYmUoanNtRERlc2NyaWJlLCAuLi5hcmdzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHhkZXNjcmliZSguLi5hcmdzKTogdm9pZCB7XG4gIHJldHVybiBfZGVzY3JpYmUoanNtWERlc2NyaWJlLCAuLi5hcmdzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZUVhY2goZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgU3luY1Rlc3RGbik6IHZvaWQge1xuICBpZiAocnVubmVyU3RhY2subGVuZ3RoID4gMCkge1xuICAgIC8vIEluc2lkZSBhIGRlc2NyaWJlIGJsb2NrLCBiZWZvcmVFYWNoKCkgdXNlcyBhIEJlZm9yZUVhY2hSdW5uZXJcbiAgICBydW5uZXJTdGFja1tydW5uZXJTdGFjay5sZW5ndGggLSAxXS5iZWZvcmVFYWNoKGZuKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUb3AgbGV2ZWwgYmVmb3JlRWFjaCgpIGFyZSBkZWxlZ2F0ZWQgdG8gamFzbWluZVxuICAgIGpzbUJlZm9yZUVhY2goPFN5bmNUZXN0Rm4+Zm4pO1xuICB9XG59XG5cbi8qKlxuICogQWxsb3dzIG92ZXJyaWRpbmcgZGVmYXVsdCBwcm92aWRlcnMgZGVmaW5lZCBpbiB0ZXN0X2luamVjdG9yLmpzLlxuICpcbiAqIFRoZSBnaXZlbiBmdW5jdGlvbiBtdXN0IHJldHVybiBhIGxpc3Qgb2YgREkgcHJvdmlkZXJzLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICBiZWZvcmVFYWNoUHJvdmlkZXJzKCgpID0+IFtcbiAqICAgICBwcm92aWRlKENvbXBpbGVyLCB7dXNlQ2xhc3M6IE1vY2tDb21waWxlcn0pLFxuICogICAgIHByb3ZpZGUoU29tZVRva2VuLCB7dXNlVmFsdWU6IG15VmFsdWV9KSxcbiAqICAgXSk7XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVFYWNoUHJvdmlkZXJzKGZuKTogdm9pZCB7XG4gIGpzbUJlZm9yZUVhY2goKCkgPT4ge1xuICAgIHZhciBwcm92aWRlcnMgPSBmbigpO1xuICAgIGlmICghcHJvdmlkZXJzKSByZXR1cm47XG4gICAgdGVzdEluamVjdG9yLmFkZFByb3ZpZGVycyhwcm92aWRlcnMpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBAZGVwcmVjYXRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlRWFjaEJpbmRpbmdzKGZuKTogdm9pZCB7XG4gIGJlZm9yZUVhY2hQcm92aWRlcnMoZm4pO1xufVxuXG5mdW5jdGlvbiBfaXQoanNtRm46IEZ1bmN0aW9uLCBuYW1lOiBzdHJpbmcsIHRlc3RGbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBBbnlUZXN0Rm4sXG4gICAgICAgICAgICAgdGVzdFRpbWVPdXQ6IG51bWJlcik6IHZvaWQge1xuICB2YXIgcnVubmVyID0gcnVubmVyU3RhY2tbcnVubmVyU3RhY2subGVuZ3RoIC0gMV07XG4gIHZhciB0aW1lT3V0ID0gTWF0aC5tYXgoZ2xvYmFsVGltZU91dCwgdGVzdFRpbWVPdXQpO1xuXG4gIGlmICh0ZXN0Rm4gaW5zdGFuY2VvZiBGdW5jdGlvbldpdGhQYXJhbVRva2Vucykge1xuICAgIC8vIFRoZSB0ZXN0IGNhc2UgdXNlcyBpbmplY3QoKS4gaWUgYGl0KCd0ZXN0JywgaW5qZWN0KFtBc3luY1Rlc3RDb21wbGV0ZXJdLCAoYXN5bmMpID0+IHsgLi4uXG4gICAgLy8gfSkpO2BcblxuICAgIGlmICh0ZXN0Rm4uaGFzVG9rZW4oQXN5bmNUZXN0Q29tcGxldGVyKSkge1xuICAgICAganNtRm4obmFtZSwgKGRvbmUpID0+IHtcbiAgICAgICAgdmFyIGNvbXBsZXRlclByb3ZpZGVyID0gcHJvdmlkZShBc3luY1Rlc3RDb21wbGV0ZXIsIHtcbiAgICAgICAgICB1c2VGYWN0b3J5OiAoKSA9PiB7XG4gICAgICAgICAgICAvLyBNYXJrIHRoZSB0ZXN0IGFzIGFzeW5jIHdoZW4gYW4gQXN5bmNUZXN0Q29tcGxldGVyIGlzIGluamVjdGVkIGluIGFuIGl0KClcbiAgICAgICAgICAgIGlmICghaW5JdCkgdGhyb3cgbmV3IEVycm9yKCdBc3luY1Rlc3RDb21wbGV0ZXIgY2FuIG9ubHkgYmUgaW5qZWN0ZWQgaW4gYW4gXCJpdCgpXCInKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQXN5bmNUZXN0Q29tcGxldGVyKGRvbmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGVzdEluamVjdG9yLmFkZFByb3ZpZGVycyhbY29tcGxldGVyUHJvdmlkZXJdKTtcbiAgICAgICAgcnVubmVyLnJ1bigpO1xuXG4gICAgICAgIGluSXQgPSB0cnVlO1xuICAgICAgICB0ZXN0SW5qZWN0b3IuZXhlY3V0ZSh0ZXN0Rm4pO1xuICAgICAgICBpbkl0ID0gZmFsc2U7XG4gICAgICB9LCB0aW1lT3V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAganNtRm4obmFtZSwgKCkgPT4ge1xuICAgICAgICBydW5uZXIucnVuKCk7XG4gICAgICAgIHRlc3RJbmplY3Rvci5leGVjdXRlKHRlc3RGbik7XG4gICAgICB9LCB0aW1lT3V0KTtcbiAgICB9XG5cbiAgfSBlbHNlIHtcbiAgICAvLyBUaGUgdGVzdCBjYXNlIGRvZXNuJ3QgdXNlIGluamVjdCgpLiBpZSBgaXQoJ3Rlc3QnLCAoZG9uZSkgPT4geyAuLi4gfSkpO2BcblxuICAgIGlmICgoPGFueT50ZXN0Rm4pLmxlbmd0aCA9PT0gMCkge1xuICAgICAganNtRm4obmFtZSwgKCkgPT4ge1xuICAgICAgICBydW5uZXIucnVuKCk7XG4gICAgICAgICg8U3luY1Rlc3RGbj50ZXN0Rm4pKCk7XG4gICAgICB9LCB0aW1lT3V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAganNtRm4obmFtZSwgKGRvbmUpID0+IHtcbiAgICAgICAgcnVubmVyLnJ1bigpO1xuICAgICAgICAoPEFzeW5jVGVzdEZuPnRlc3RGbikoZG9uZSk7XG4gICAgICB9LCB0aW1lT3V0KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGl0KG5hbWUsIGZuLCB0aW1lT3V0ID0gbnVsbCk6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbUl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB4aXQobmFtZSwgZm4sIHRpbWVPdXQgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtWEl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpaXQobmFtZSwgZm4sIHRpbWVPdXQgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtSUl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cblxuZXhwb3J0IGludGVyZmFjZSBHdWluZXNzQ29tcGF0aWJsZVNweSBleHRlbmRzIGphc21pbmUuU3B5IHtcbiAgLyoqIEJ5IGNoYWluaW5nIHRoZSBzcHkgd2l0aCBhbmQucmV0dXJuVmFsdWUsIGFsbCBjYWxscyB0byB0aGUgZnVuY3Rpb24gd2lsbCByZXR1cm4gYSBzcGVjaWZpY1xuICAgKiB2YWx1ZS4gKi9cbiAgYW5kUmV0dXJuKHZhbDogYW55KTogdm9pZDtcbiAgLyoqIEJ5IGNoYWluaW5nIHRoZSBzcHkgd2l0aCBhbmQuY2FsbEZha2UsIGFsbCBjYWxscyB0byB0aGUgc3B5IHdpbGwgZGVsZWdhdGUgdG8gdGhlIHN1cHBsaWVkXG4gICAqIGZ1bmN0aW9uLiAqL1xuICBhbmRDYWxsRmFrZShmbjogRnVuY3Rpb24pOiBHdWluZXNzQ29tcGF0aWJsZVNweTtcbiAgLyoqIHJlbW92ZXMgYWxsIHJlY29yZGVkIGNhbGxzICovXG4gIHJlc2V0KCk7XG59XG5cbmV4cG9ydCBjbGFzcyBTcHlPYmplY3Qge1xuICBjb25zdHJ1Y3Rvcih0eXBlID0gbnVsbCkge1xuICAgIGlmICh0eXBlKSB7XG4gICAgICBmb3IgKHZhciBwcm9wIGluIHR5cGUucHJvdG90eXBlKSB7XG4gICAgICAgIHZhciBtID0gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBtID0gdHlwZS5wcm90b3R5cGVbcHJvcF07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAvLyBBcyB3ZSBhcmUgY3JlYXRpbmcgc3B5cyBmb3IgYWJzdHJhY3QgY2xhc3NlcyxcbiAgICAgICAgICAvLyB0aGVzZSBjbGFzc2VzIG1pZ2h0IGhhdmUgZ2V0dGVycyB0aGF0IHRocm93IHdoZW4gdGhleSBhcmUgYWNjZXNzZWQuXG4gICAgICAgICAgLy8gQXMgd2UgYXJlIG9ubHkgYXV0byBjcmVhdGluZyBzcHlzIGZvciBtZXRob2RzLCB0aGlzXG4gICAgICAgICAgLy8gc2hvdWxkIG5vdCBtYXR0ZXIuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBtID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5zcHkocHJvcCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gTm9vcCBzbyB0aGF0IFNweU9iamVjdCBoYXMgdGhlIHNhbWUgaW50ZXJmYWNlIGFzIGluIERhcnRcbiAgbm9TdWNoTWV0aG9kKGFyZ3MpIHt9XG5cbiAgc3B5KG5hbWUpIHtcbiAgICBpZiAoIXRoaXNbbmFtZV0pIHtcbiAgICAgIHRoaXNbbmFtZV0gPSB0aGlzLl9jcmVhdGVHdWlubmVzc0NvbXBhdGlibGVTcHkobmFtZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzW25hbWVdO1xuICB9XG5cbiAgcHJvcChuYW1lLCB2YWx1ZSkgeyB0aGlzW25hbWVdID0gdmFsdWU7IH1cblxuICBzdGF0aWMgc3R1YihvYmplY3QgPSBudWxsLCBjb25maWcgPSBudWxsLCBvdmVycmlkZXMgPSBudWxsKSB7XG4gICAgaWYgKCEob2JqZWN0IGluc3RhbmNlb2YgU3B5T2JqZWN0KSkge1xuICAgICAgb3ZlcnJpZGVzID0gY29uZmlnO1xuICAgICAgY29uZmlnID0gb2JqZWN0O1xuICAgICAgb2JqZWN0ID0gbmV3IFNweU9iamVjdCgpO1xuICAgIH1cblxuICAgIHZhciBtID0gU3RyaW5nTWFwV3JhcHBlci5tZXJnZShjb25maWcsIG92ZXJyaWRlcyk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKG0sICh2YWx1ZSwga2V5KSA9PiB7IG9iamVjdC5zcHkoa2V5KS5hbmRSZXR1cm4odmFsdWUpOyB9KTtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY3JlYXRlR3Vpbm5lc3NDb21wYXRpYmxlU3B5KG5hbWUpOiBHdWluZXNzQ29tcGF0aWJsZVNweSB7XG4gICAgdmFyIG5ld1NweTogR3VpbmVzc0NvbXBhdGlibGVTcHkgPSA8YW55Pmphc21pbmUuY3JlYXRlU3B5KG5hbWUpO1xuICAgIG5ld1NweS5hbmRDYWxsRmFrZSA9IDxhbnk+bmV3U3B5LmFuZC5jYWxsRmFrZTtcbiAgICBuZXdTcHkuYW5kUmV0dXJuID0gPGFueT5uZXdTcHkuYW5kLnJldHVyblZhbHVlO1xuICAgIG5ld1NweS5yZXNldCA9IDxhbnk+bmV3U3B5LmNhbGxzLnJlc2V0O1xuICAgIC8vIHJldmlzaXQgcmV0dXJuIG51bGwgaGVyZSAocHJldmlvdXNseSBuZWVkZWQgZm9yIHJ0dHNfYXNzZXJ0KS5cbiAgICBuZXdTcHkuYW5kLnJldHVyblZhbHVlKG51bGwpO1xuICAgIHJldHVybiBuZXdTcHk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSW5Jbm5lclpvbmUoKTogYm9vbGVhbiB7XG4gIHJldHVybiAoPE5nWm9uZVpvbmU+Z2xvYmFsLnpvbmUpLl9pbm5lclpvbmUgPT09IHRydWU7XG59XG4iXX0=