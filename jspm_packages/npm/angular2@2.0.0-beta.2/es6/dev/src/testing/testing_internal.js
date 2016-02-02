import { StringMapWrapper } from 'angular2/src/facade/collection';
import { global, isFunction, Math } from 'angular2/src/facade/lang';
import { provide } from 'angular2/core';
import { getTestInjector, FunctionWithParamTokens } from './test_injector';
import { browserDetection } from './utils';
export { inject } from './test_injector';
export { expect } from './matchers';
export var proxy = (t) => t;
var _global = (typeof window === 'undefined' ? global : window);
export var afterEach = _global.afterEach;
/**
 * Injectable completer that allows signaling completion of an asynchronous test. Used internally.
 */
export class AsyncTestCompleter {
    constructor(_done) {
        this._done = _done;
    }
    done() { this._done(); }
}
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
var globalTimeOut = browserDetection.isSlow ? 3000 : jasmine.DEFAULT_TIMEOUT_INTERVAL;
var testInjector = getTestInjector();
/**
 * Mechanism to run `beforeEach()` functions of Angular tests.
 *
 * Note: Jasmine own `beforeEach` is used by this library to handle DI providers.
 */
class BeforeEachRunner {
    constructor(_parent) {
        this._parent = _parent;
        this._fns = [];
    }
    beforeEach(fn) { this._fns.push(fn); }
    run() {
        if (this._parent)
            this._parent.run();
        this._fns.forEach((fn) => {
            return isFunction(fn) ? fn() :
                (testInjector.execute(fn));
        });
    }
}
// Reset the test providers before each test
jsmBeforeEach(() => { testInjector.reset(); });
function _describe(jsmFn, ...args) {
    var parentRunner = runnerStack.length === 0 ? null : runnerStack[runnerStack.length - 1];
    var runner = new BeforeEachRunner(parentRunner);
    runnerStack.push(runner);
    var suite = jsmFn(...args);
    runnerStack.pop();
    return suite;
}
export function describe(...args) {
    return _describe(jsmDescribe, ...args);
}
export function ddescribe(...args) {
    return _describe(jsmDDescribe, ...args);
}
export function xdescribe(...args) {
    return _describe(jsmXDescribe, ...args);
}
export function beforeEach(fn) {
    if (runnerStack.length > 0) {
        // Inside a describe block, beforeEach() uses a BeforeEachRunner
        runnerStack[runnerStack.length - 1].beforeEach(fn);
    }
    else {
        // Top level beforeEach() are delegated to jasmine
        jsmBeforeEach(fn);
    }
}
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
export function beforeEachProviders(fn) {
    jsmBeforeEach(() => {
        var providers = fn();
        if (!providers)
            return;
        testInjector.addProviders(providers);
    });
}
/**
 * @deprecated
 */
export function beforeEachBindings(fn) {
    beforeEachProviders(fn);
}
function _it(jsmFn, name, testFn, testTimeOut) {
    var runner = runnerStack[runnerStack.length - 1];
    var timeOut = Math.max(globalTimeOut, testTimeOut);
    if (testFn instanceof FunctionWithParamTokens) {
        // The test case uses inject(). ie `it('test', inject([AsyncTestCompleter], (async) => { ...
        // }));`
        if (testFn.hasToken(AsyncTestCompleter)) {
            jsmFn(name, (done) => {
                var completerProvider = provide(AsyncTestCompleter, {
                    useFactory: () => {
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
            jsmFn(name, () => {
                runner.run();
                testInjector.execute(testFn);
            }, timeOut);
        }
    }
    else {
        // The test case doesn't use inject(). ie `it('test', (done) => { ... }));`
        if (testFn.length === 0) {
            jsmFn(name, () => {
                runner.run();
                testFn();
            }, timeOut);
        }
        else {
            jsmFn(name, (done) => {
                runner.run();
                testFn(done);
            }, timeOut);
        }
    }
}
export function it(name, fn, timeOut = null) {
    return _it(jsmIt, name, fn, timeOut);
}
export function xit(name, fn, timeOut = null) {
    return _it(jsmXIt, name, fn, timeOut);
}
export function iit(name, fn, timeOut = null) {
    return _it(jsmIIt, name, fn, timeOut);
}
export class SpyObject {
    constructor(type = null) {
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
    noSuchMethod(args) { }
    spy(name) {
        if (!this[name]) {
            this[name] = this._createGuinnessCompatibleSpy(name);
        }
        return this[name];
    }
    prop(name, value) { this[name] = value; }
    static stub(object = null, config = null, overrides = null) {
        if (!(object instanceof SpyObject)) {
            overrides = config;
            config = object;
            object = new SpyObject();
        }
        var m = StringMapWrapper.merge(config, overrides);
        StringMapWrapper.forEach(m, (value, key) => { object.spy(key).andReturn(value); });
        return object;
    }
    /** @internal */
    _createGuinnessCompatibleSpy(name) {
        var newSpy = jasmine.createSpy(name);
        newSpy.andCallFake = newSpy.and.callFake;
        newSpy.andReturn = newSpy.and.returnValue;
        newSpy.reset = newSpy.calls.reset;
        // revisit return null here (previously needed for rtts_assert).
        newSpy.and.returnValue(null);
        return newSpy;
    }
}
export function isInInnerZone() {
    return global.zone._innerZone === true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ19pbnRlcm5hbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RpbmdfaW50ZXJuYWwudHMiXSwibmFtZXMiOlsiQXN5bmNUZXN0Q29tcGxldGVyIiwiQXN5bmNUZXN0Q29tcGxldGVyLmNvbnN0cnVjdG9yIiwiQXN5bmNUZXN0Q29tcGxldGVyLmRvbmUiLCJCZWZvcmVFYWNoUnVubmVyIiwiQmVmb3JlRWFjaFJ1bm5lci5jb25zdHJ1Y3RvciIsIkJlZm9yZUVhY2hSdW5uZXIuYmVmb3JlRWFjaCIsIkJlZm9yZUVhY2hSdW5uZXIucnVuIiwiX2Rlc2NyaWJlIiwiZGVzY3JpYmUiLCJkZGVzY3JpYmUiLCJ4ZGVzY3JpYmUiLCJiZWZvcmVFYWNoIiwiYmVmb3JlRWFjaFByb3ZpZGVycyIsImJlZm9yZUVhY2hCaW5kaW5ncyIsIl9pdCIsIml0IiwieGl0IiwiaWl0IiwiU3B5T2JqZWN0IiwiU3B5T2JqZWN0LmNvbnN0cnVjdG9yIiwiU3B5T2JqZWN0Lm5vU3VjaE1ldGhvZCIsIlNweU9iamVjdC5zcHkiLCJTcHlPYmplY3QucHJvcCIsIlNweU9iamVjdC5zdHViIiwiU3B5T2JqZWN0Ll9jcmVhdGVHdWlubmVzc0NvbXBhdGlibGVTcHkiLCJpc0luSW5uZXJab25lIl0sIm1hcHBpbmdzIjoiT0FDTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BQ3hELEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUMsTUFBTSwwQkFBMEI7T0FHMUQsRUFBQyxPQUFPLEVBQUMsTUFBTSxlQUFlO09BRTlCLEVBQWUsZUFBZSxFQUFFLHVCQUF1QixFQUFTLE1BQU0saUJBQWlCO09BQ3ZGLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxTQUFTO0FBRXhDLFNBQVEsTUFBTSxRQUFPLGlCQUFpQixDQUFDO0FBRXZDLFNBQVEsTUFBTSxRQUFtQixZQUFZLENBQUM7QUFFOUMsV0FBVyxLQUFLLEdBQW1CLENBQUMs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LE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO0lBQ2hCQSxDQUFDQTtJQUVETCxnQkFBZ0JBO0lBQ2hCQSw0QkFBNEJBLENBQUNBLElBQUlBO1FBQy9CTSxJQUFJQSxNQUFNQSxHQUE4QkEsT0FBT0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDaEVBLE1BQU1BLENBQUNBLFdBQVdBLEdBQVFBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLFFBQVFBLENBQUNBO1FBQzlDQSxNQUFNQSxDQUFDQSxTQUFTQSxHQUFRQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxXQUFXQSxDQUFDQTtRQUMvQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBUUEsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDdkNBLGdFQUFnRUE7UUFDaEVBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQzdCQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUNoQkEsQ0FBQ0E7QUFDSE4sQ0FBQ0E7QUFFRDtJQUNFTyxNQUFNQSxDQUFjQSxNQUFNQSxDQUFDQSxJQUFLQSxDQUFDQSxVQUFVQSxLQUFLQSxJQUFJQSxDQUFDQTtBQUN2REEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2dsb2JhbCwgaXNGdW5jdGlvbiwgTWF0aH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7Tmdab25lWm9uZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvem9uZS9uZ196b25lJztcblxuaW1wb3J0IHtwcm92aWRlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0IHtUZXN0SW5qZWN0b3IsIGdldFRlc3RJbmplY3RvciwgRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMsIGluamVjdH0gZnJvbSAnLi90ZXN0X2luamVjdG9yJztcbmltcG9ydCB7YnJvd3NlckRldGVjdGlvbn0gZnJvbSAnLi91dGlscyc7XG5cbmV4cG9ydCB7aW5qZWN0fSBmcm9tICcuL3Rlc3RfaW5qZWN0b3InO1xuXG5leHBvcnQge2V4cGVjdCwgTmdNYXRjaGVyc30gZnJvbSAnLi9tYXRjaGVycyc7XG5cbmV4cG9ydCB2YXIgcHJveHk6IENsYXNzRGVjb3JhdG9yID0gKHQpID0+IHQ7XG5cbnZhciBfZ2xvYmFsOiBqYXNtaW5lLkdsb2JhbFBvbGx1dGVyID0gPGFueT4odHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB3aW5kb3cpO1xuXG5leHBvcnQgdmFyIGFmdGVyRWFjaDogRnVuY3Rpb24gPSBfZ2xvYmFsLmFmdGVyRWFjaDtcblxuZXhwb3J0IHR5cGUgU3luY1Rlc3RGbiA9ICgpID0+IHZvaWQ7XG50eXBlIEFzeW5jVGVzdEZuID0gKGRvbmU6ICgpID0+IHZvaWQpID0+IHZvaWQ7XG50eXBlIEFueVRlc3RGbiA9IFN5bmNUZXN0Rm4gfCBBc3luY1Rlc3RGbjtcblxuLyoqXG4gKiBJbmplY3RhYmxlIGNvbXBsZXRlciB0aGF0IGFsbG93cyBzaWduYWxpbmcgY29tcGxldGlvbiBvZiBhbiBhc3luY2hyb25vdXMgdGVzdC4gVXNlZCBpbnRlcm5hbGx5LlxuICovXG5leHBvcnQgY2xhc3MgQXN5bmNUZXN0Q29tcGxldGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZG9uZTogRnVuY3Rpb24pIHt9XG5cbiAgZG9uZSgpOiB2b2lkIHsgdGhpcy5fZG9uZSgpOyB9XG59XG5cbnZhciBqc21CZWZvcmVFYWNoID0gX2dsb2JhbC5iZWZvcmVFYWNoO1xudmFyIGpzbURlc2NyaWJlID0gX2dsb2JhbC5kZXNjcmliZTtcbnZhciBqc21ERGVzY3JpYmUgPSBfZ2xvYmFsLmZkZXNjcmliZTtcbnZhciBqc21YRGVzY3JpYmUgPSBfZ2xvYmFsLnhkZXNjcmliZTtcbnZhciBqc21JdCA9IF9nbG9iYWwuaXQ7XG52YXIganNtSUl0ID0gX2dsb2JhbC5maXQ7XG52YXIganNtWEl0ID0gX2dsb2JhbC54aXQ7XG5cbnZhciBydW5uZXJTdGFjayA9IFtdO1xudmFyIGluSXQgPSBmYWxzZTtcbmphc21pbmUuREVGQVVMVF9USU1FT1VUX0lOVEVSVkFMID0gNTAwO1xudmFyIGdsb2JhbFRpbWVPdXQgPSBicm93c2VyRGV0ZWN0aW9uLmlzU2xvdyA/IDMwMDAgOiBqYXNtaW5lLkRFRkFVTFRfVElNRU9VVF9JTlRFUlZBTDtcblxudmFyIHRlc3RJbmplY3RvciA9IGdldFRlc3RJbmplY3RvcigpO1xuXG4vKipcbiAqIE1lY2hhbmlzbSB0byBydW4gYGJlZm9yZUVhY2goKWAgZnVuY3Rpb25zIG9mIEFuZ3VsYXIgdGVzdHMuXG4gKlxuICogTm90ZTogSmFzbWluZSBvd24gYGJlZm9yZUVhY2hgIGlzIHVzZWQgYnkgdGhpcyBsaWJyYXJ5IHRvIGhhbmRsZSBESSBwcm92aWRlcnMuXG4gKi9cbmNsYXNzIEJlZm9yZUVhY2hSdW5uZXIge1xuICBwcml2YXRlIF9mbnM6IEFycmF5PEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgU3luY1Rlc3RGbj4gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wYXJlbnQ6IEJlZm9yZUVhY2hSdW5uZXIpIHt9XG5cbiAgYmVmb3JlRWFjaChmbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBTeW5jVGVzdEZuKTogdm9pZCB7IHRoaXMuX2Zucy5wdXNoKGZuKTsgfVxuXG4gIHJ1bigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcGFyZW50KSB0aGlzLl9wYXJlbnQucnVuKCk7XG4gICAgdGhpcy5fZm5zLmZvckVhY2goKGZuKSA9PiB7XG4gICAgICByZXR1cm4gaXNGdW5jdGlvbihmbikgPyAoPFN5bmNUZXN0Rm4+Zm4pKCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHRlc3RJbmplY3Rvci5leGVjdXRlKDxGdW5jdGlvbldpdGhQYXJhbVRva2Vucz5mbikpO1xuICAgIH0pO1xuICB9XG59XG5cbi8vIFJlc2V0IHRoZSB0ZXN0IHByb3ZpZGVycyBiZWZvcmUgZWFjaCB0ZXN0XG5qc21CZWZvcmVFYWNoKCgpID0+IHsgdGVzdEluamVjdG9yLnJlc2V0KCk7IH0pO1xuXG5mdW5jdGlvbiBfZGVzY3JpYmUoanNtRm4sIC4uLmFyZ3MpIHtcbiAgdmFyIHBhcmVudFJ1bm5lciA9IHJ1bm5lclN0YWNrLmxlbmd0aCA9PT0gMCA/IG51bGwgOiBydW5uZXJTdGFja1tydW5uZXJTdGFjay5sZW5ndGggLSAxXTtcbiAgdmFyIHJ1bm5lciA9IG5ldyBCZWZvcmVFYWNoUnVubmVyKHBhcmVudFJ1bm5lcik7XG4gIHJ1bm5lclN0YWNrLnB1c2gocnVubmVyKTtcbiAgdmFyIHN1aXRlID0ganNtRm4oLi4uYXJncyk7XG4gIHJ1bm5lclN0YWNrLnBvcCgpO1xuICByZXR1cm4gc3VpdGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXNjcmliZSguLi5hcmdzKTogdm9pZCB7XG4gIHJldHVybiBfZGVzY3JpYmUoanNtRGVzY3JpYmUsIC4uLmFyZ3MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGRlc2NyaWJlKC4uLmFyZ3MpOiB2b2lkIHtcbiAgcmV0dXJuIF9kZXNjcmliZShqc21ERGVzY3JpYmUsIC4uLmFyZ3MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24geGRlc2NyaWJlKC4uLmFyZ3MpOiB2b2lkIHtcbiAgcmV0dXJuIF9kZXNjcmliZShqc21YRGVzY3JpYmUsIC4uLmFyZ3MpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlRWFjaChmbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBTeW5jVGVzdEZuKTogdm9pZCB7XG4gIGlmIChydW5uZXJTdGFjay5sZW5ndGggPiAwKSB7XG4gICAgLy8gSW5zaWRlIGEgZGVzY3JpYmUgYmxvY2ssIGJlZm9yZUVhY2goKSB1c2VzIGEgQmVmb3JlRWFjaFJ1bm5lclxuICAgIHJ1bm5lclN0YWNrW3J1bm5lclN0YWNrLmxlbmd0aCAtIDFdLmJlZm9yZUVhY2goZm4pO1xuICB9IGVsc2Uge1xuICAgIC8vIFRvcCBsZXZlbCBiZWZvcmVFYWNoKCkgYXJlIGRlbGVnYXRlZCB0byBqYXNtaW5lXG4gICAganNtQmVmb3JlRWFjaCg8U3luY1Rlc3RGbj5mbik7XG4gIH1cbn1cblxuLyoqXG4gKiBBbGxvd3Mgb3ZlcnJpZGluZyBkZWZhdWx0IHByb3ZpZGVycyBkZWZpbmVkIGluIHRlc3RfaW5qZWN0b3IuanMuXG4gKlxuICogVGhlIGdpdmVuIGZ1bmN0aW9uIG11c3QgcmV0dXJuIGEgbGlzdCBvZiBESSBwcm92aWRlcnMuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgIGJlZm9yZUVhY2hQcm92aWRlcnMoKCkgPT4gW1xuICogICAgIHByb3ZpZGUoQ29tcGlsZXIsIHt1c2VDbGFzczogTW9ja0NvbXBpbGVyfSksXG4gKiAgICAgcHJvdmlkZShTb21lVG9rZW4sIHt1c2VWYWx1ZTogbXlWYWx1ZX0pLFxuICogICBdKTtcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZUVhY2hQcm92aWRlcnMoZm4pOiB2b2lkIHtcbiAganNtQmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgdmFyIHByb3ZpZGVycyA9IGZuKCk7XG4gICAgaWYgKCFwcm92aWRlcnMpIHJldHVybjtcbiAgICB0ZXN0SW5qZWN0b3IuYWRkUHJvdmlkZXJzKHByb3ZpZGVycyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVFYWNoQmluZGluZ3MoZm4pOiB2b2lkIHtcbiAgYmVmb3JlRWFjaFByb3ZpZGVycyhmbik7XG59XG5cbmZ1bmN0aW9uIF9pdChqc21GbjogRnVuY3Rpb24sIG5hbWU6IHN0cmluZywgdGVzdEZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IEFueVRlc3RGbixcbiAgICAgICAgICAgICB0ZXN0VGltZU91dDogbnVtYmVyKTogdm9pZCB7XG4gIHZhciBydW5uZXIgPSBydW5uZXJTdGFja1tydW5uZXJTdGFjay5sZW5ndGggLSAxXTtcbiAgdmFyIHRpbWVPdXQgPSBNYXRoLm1heChnbG9iYWxUaW1lT3V0LCB0ZXN0VGltZU91dCk7XG5cbiAgaWYgKHRlc3RGbiBpbnN0YW5jZW9mIEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zKSB7XG4gICAgLy8gVGhlIHRlc3QgY2FzZSB1c2VzIGluamVjdCgpLiBpZSBgaXQoJ3Rlc3QnLCBpbmplY3QoW0FzeW5jVGVzdENvbXBsZXRlcl0sIChhc3luYykgPT4geyAuLi5cbiAgICAvLyB9KSk7YFxuXG4gICAgaWYgKHRlc3RGbi5oYXNUb2tlbihBc3luY1Rlc3RDb21wbGV0ZXIpKSB7XG4gICAgICBqc21GbihuYW1lLCAoZG9uZSkgPT4ge1xuICAgICAgICB2YXIgY29tcGxldGVyUHJvdmlkZXIgPSBwcm92aWRlKEFzeW5jVGVzdENvbXBsZXRlciwge1xuICAgICAgICAgIHVzZUZhY3Rvcnk6ICgpID0+IHtcbiAgICAgICAgICAgIC8vIE1hcmsgdGhlIHRlc3QgYXMgYXN5bmMgd2hlbiBhbiBBc3luY1Rlc3RDb21wbGV0ZXIgaXMgaW5qZWN0ZWQgaW4gYW4gaXQoKVxuICAgICAgICAgICAgaWYgKCFpbkl0KSB0aHJvdyBuZXcgRXJyb3IoJ0FzeW5jVGVzdENvbXBsZXRlciBjYW4gb25seSBiZSBpbmplY3RlZCBpbiBhbiBcIml0KClcIicpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBBc3luY1Rlc3RDb21wbGV0ZXIoZG9uZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0ZXN0SW5qZWN0b3IuYWRkUHJvdmlkZXJzKFtjb21wbGV0ZXJQcm92aWRlcl0pO1xuICAgICAgICBydW5uZXIucnVuKCk7XG5cbiAgICAgICAgaW5JdCA9IHRydWU7XG4gICAgICAgIHRlc3RJbmplY3Rvci5leGVjdXRlKHRlc3RGbik7XG4gICAgICAgIGluSXQgPSBmYWxzZTtcbiAgICAgIH0sIHRpbWVPdXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBqc21GbihuYW1lLCAoKSA9PiB7XG4gICAgICAgIHJ1bm5lci5ydW4oKTtcbiAgICAgICAgdGVzdEluamVjdG9yLmV4ZWN1dGUodGVzdEZuKTtcbiAgICAgIH0sIHRpbWVPdXQpO1xuICAgIH1cblxuICB9IGVsc2Uge1xuICAgIC8vIFRoZSB0ZXN0IGNhc2UgZG9lc24ndCB1c2UgaW5qZWN0KCkuIGllIGBpdCgndGVzdCcsIChkb25lKSA9PiB7IC4uLiB9KSk7YFxuXG4gICAgaWYgKCg8YW55PnRlc3RGbikubGVuZ3RoID09PSAwKSB7XG4gICAgICBqc21GbihuYW1lLCAoKSA9PiB7XG4gICAgICAgIHJ1bm5lci5ydW4oKTtcbiAgICAgICAgKDxTeW5jVGVzdEZuPnRlc3RGbikoKTtcbiAgICAgIH0sIHRpbWVPdXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBqc21GbihuYW1lLCAoZG9uZSkgPT4ge1xuICAgICAgICBydW5uZXIucnVuKCk7XG4gICAgICAgICg8QXN5bmNUZXN0Rm4+dGVzdEZuKShkb25lKTtcbiAgICAgIH0sIHRpbWVPdXQpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXQobmFtZSwgZm4sIHRpbWVPdXQgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtSXQsIG5hbWUsIGZuLCB0aW1lT3V0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHhpdChuYW1lLCBmbiwgdGltZU91dCA9IG51bGwpOiB2b2lkIHtcbiAgcmV0dXJuIF9pdChqc21YSXQsIG5hbWUsIGZuLCB0aW1lT3V0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlpdChuYW1lLCBmbiwgdGltZU91dCA9IG51bGwpOiB2b2lkIHtcbiAgcmV0dXJuIF9pdChqc21JSXQsIG5hbWUsIGZuLCB0aW1lT3V0KTtcbn1cblxuXG5leHBvcnQgaW50ZXJmYWNlIEd1aW5lc3NDb21wYXRpYmxlU3B5IGV4dGVuZHMgamFzbWluZS5TcHkge1xuICAvKiogQnkgY2hhaW5pbmcgdGhlIHNweSB3aXRoIGFuZC5yZXR1cm5WYWx1ZSwgYWxsIGNhbGxzIHRvIHRoZSBmdW5jdGlvbiB3aWxsIHJldHVybiBhIHNwZWNpZmljXG4gICAqIHZhbHVlLiAqL1xuICBhbmRSZXR1cm4odmFsOiBhbnkpOiB2b2lkO1xuICAvKiogQnkgY2hhaW5pbmcgdGhlIHNweSB3aXRoIGFuZC5jYWxsRmFrZSwgYWxsIGNhbGxzIHRvIHRoZSBzcHkgd2lsbCBkZWxlZ2F0ZSB0byB0aGUgc3VwcGxpZWRcbiAgICogZnVuY3Rpb24uICovXG4gIGFuZENhbGxGYWtlKGZuOiBGdW5jdGlvbik6IEd1aW5lc3NDb21wYXRpYmxlU3B5O1xuICAvKiogcmVtb3ZlcyBhbGwgcmVjb3JkZWQgY2FsbHMgKi9cbiAgcmVzZXQoKTtcbn1cblxuZXhwb3J0IGNsYXNzIFNweU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yKHR5cGUgPSBudWxsKSB7XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIGZvciAodmFyIHByb3AgaW4gdHlwZS5wcm90b3R5cGUpIHtcbiAgICAgICAgdmFyIG0gPSBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIG0gPSB0eXBlLnByb3RvdHlwZVtwcm9wXTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIEFzIHdlIGFyZSBjcmVhdGluZyBzcHlzIGZvciBhYnN0cmFjdCBjbGFzc2VzLFxuICAgICAgICAgIC8vIHRoZXNlIGNsYXNzZXMgbWlnaHQgaGF2ZSBnZXR0ZXJzIHRoYXQgdGhyb3cgd2hlbiB0aGV5IGFyZSBhY2Nlc3NlZC5cbiAgICAgICAgICAvLyBBcyB3ZSBhcmUgb25seSBhdXRvIGNyZWF0aW5nIHNweXMgZm9yIG1ldGhvZHMsIHRoaXNcbiAgICAgICAgICAvLyBzaG91bGQgbm90IG1hdHRlci5cbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIG0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB0aGlzLnNweShwcm9wKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBOb29wIHNvIHRoYXQgU3B5T2JqZWN0IGhhcyB0aGUgc2FtZSBpbnRlcmZhY2UgYXMgaW4gRGFydFxuICBub1N1Y2hNZXRob2QoYXJncykge31cblxuICBzcHkobmFtZSkge1xuICAgIGlmICghdGhpc1tuYW1lXSkge1xuICAgICAgdGhpc1tuYW1lXSA9IHRoaXMuX2NyZWF0ZUd1aW5uZXNzQ29tcGF0aWJsZVNweShuYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNbbmFtZV07XG4gIH1cblxuICBwcm9wKG5hbWUsIHZhbHVlKSB7IHRoaXNbbmFtZV0gPSB2YWx1ZTsgfVxuXG4gIHN0YXRpYyBzdHViKG9iamVjdCA9IG51bGwsIGNvbmZpZyA9IG51bGwsIG92ZXJyaWRlcyA9IG51bGwpIHtcbiAgICBpZiAoIShvYmplY3QgaW5zdGFuY2VvZiBTcHlPYmplY3QpKSB7XG4gICAgICBvdmVycmlkZXMgPSBjb25maWc7XG4gICAgICBjb25maWcgPSBvYmplY3Q7XG4gICAgICBvYmplY3QgPSBuZXcgU3B5T2JqZWN0KCk7XG4gICAgfVxuXG4gICAgdmFyIG0gPSBTdHJpbmdNYXBXcmFwcGVyLm1lcmdlKGNvbmZpZywgb3ZlcnJpZGVzKTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2gobSwgKHZhbHVlLCBrZXkpID0+IHsgb2JqZWN0LnNweShrZXkpLmFuZFJldHVybih2YWx1ZSk7IH0pO1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9jcmVhdGVHdWlubmVzc0NvbXBhdGlibGVTcHkobmFtZSk6IEd1aW5lc3NDb21wYXRpYmxlU3B5IHtcbiAgICB2YXIgbmV3U3B5OiBHdWluZXNzQ29tcGF0aWJsZVNweSA9IDxhbnk+amFzbWluZS5jcmVhdGVTcHkobmFtZSk7XG4gICAgbmV3U3B5LmFuZENhbGxGYWtlID0gPGFueT5uZXdTcHkuYW5kLmNhbGxGYWtlO1xuICAgIG5ld1NweS5hbmRSZXR1cm4gPSA8YW55Pm5ld1NweS5hbmQucmV0dXJuVmFsdWU7XG4gICAgbmV3U3B5LnJlc2V0ID0gPGFueT5uZXdTcHkuY2FsbHMucmVzZXQ7XG4gICAgLy8gcmV2aXNpdCByZXR1cm4gbnVsbCBoZXJlIChwcmV2aW91c2x5IG5lZWRlZCBmb3IgcnR0c19hc3NlcnQpLlxuICAgIG5ld1NweS5hbmQucmV0dXJuVmFsdWUobnVsbCk7XG4gICAgcmV0dXJuIG5ld1NweTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJbklubmVyWm9uZSgpOiBib29sZWFuIHtcbiAgcmV0dXJuICg8Tmdab25lWm9uZT5nbG9iYWwuem9uZSkuX2lubmVyWm9uZSA9PT0gdHJ1ZTtcbn1cbiJdfQ==