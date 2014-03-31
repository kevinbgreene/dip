/**
 * A simple dependency injector. A lot of the implementation is similar to Angular.
 * Came from experimenting and learning how other dependency injectors do their
 * business. 
 *
 * @module Dip
 */
 (function(global, $) {

	'use strict';

	var dip = {};
	var apps = {};

	global.dip = dip;

    function isUndefined(value) {
        return typeof value == 'undefined';
    }

    function isDefined(value) {
        return typeof value != 'undefined';
    }

    function isObject(value) {
        return value != null && typeof value == 'object';
    }

    function isString(value) {
        return typeof value == 'string';
    }

    function isNumber(value) {
        return typeof value == 'number';
    }

    function isDate(value) {
        return toString.apply(value) == '[object Date]';
    }

    function isArray(value) {
        return toString.apply(value) == '[object Array]';
    }

    function isFunction(value) {
        return typeof value == 'function';
    }

    function isBoolean(value) {
        return typeof value == 'boolean';
    }

    function size(obj, ownPropsOnly) {

        var count = 0,
            key;

        if (isArray(obj) || isString(obj)) {
            return obj.length;
        }
        else if (isObject(obj)) {

            for (key in obj) {

                if (!ownPropsOnly || obj.hasOwnProperty(key)) {
                    count++;
                }
            }

            return count;
        }
    }

    function toDash(str) {

		return str.replace(/([A-Z])/g, function($1) {
			return "-"+$1.toLowerCase();
		});
	}

	function Injector() {

		/*
		* Just a hash to store our modules
		*/
		var modules = {};
		var views = {};
		var injectorQueue = [];
		var runQueue = [];
		var configQueue = [];

		var isReady = false;

		/*
		* Takes an array of dependencies and injects them into a function
		*
		* @method inject	
		* @param {Array} arr - array of dependencies
		* @param {Function} [fn] - invocation function
		*/
		function inject(arr, fn) {

			var mod;

			if (isString(arr)) {
				arr = [arr];
			}

			mod = {
				deps : arr,
				fn : fn
			};

			if (!isReady) {
				injectorQueue.push(mod);
			}
			else {
				return getDependencies(mod);
			}

			return null;
		}

		/*
		* Takes an array of dependencies and injects them into a function
		*
		* @method configQueue
		* @param {Array} arr - array of dependencies
		* @param {Function} [fn] - invocation function
		*/
		function _configQueue(arr, fn) {
			
			if (isReady) {
				throw new Error('Items can only be added to the config queue before run is called');
			}
			else {
				configQueue.push({
					deps : arr,
					fn : fn
				});
			}
		}

		/*
		* Takes an array of dependencies and injects them into a function
		*
		* @method runQueue
		* @param {Array} arr - array of dependencies
		* @param {Function} [fn] - invocation function
		*/
		function _runQueue(arr, fn) {

			if (isReady) {
				throw new Error('Items can only be added to the run queue before run is called');
			}
			else {
				runQueue.push({
					deps : arr,
					fn : fn
				});
			}
		}

		/*
		* Registers the view.
		*
		* @method view
		* @param {String} name - a name for the module
		* @param {Array|Function} arr - an array of dependencies and the 
		* invocation funciton or just the invocation function. Selectors 
		* must be class names, creating by converting
		* the module name to dash case
		*/
		function view(name, arr) {

			if (isUndefined(arr)) {
				throw new Error('A view needs both a name and a constructor');
			}
			else if (views[name]) {
				throw new Error('A view with name ' + name + ' already exists');
			}
			else {
				views[name] = process(name, arr);
			}

			return this;
		}

		/*
		* Registers the module.
		*
		* @method module
		* @param {String} name - a name for the module
		* @param {Array|Function} arr - an array of dependencies and the 
		* invocation funciton or just the invocation function.
		*/
		function module(name, arr) {

			if (isUndefined(arr)) {
				return modules[name] || null;
			}
			else if (modules[name]) {
				throw new Error('A module with name ' + name + ' already exists');
			}
			else {
				modules[name] = process(name, arr);
			}

			return this;
		}

		/*
		* Registers the module.
		*
		* @method process
		* @param {string} name - a name for the module
		* @param {array | function} arr - an array of dependencies and the 
		* invocation funciton or just the invocation function.
		*/
		function process(name, arr) {

			var fn = null;
			var deps = [];

			if (isArray(arr)) {

				arr.forEach(function(el) {

					if (isFunction(el)) {
						fn = el;
					}
					else {
						deps.push(el);
					}
				});
			}
			else if (isDefined(arr)) {
				fn = arr;
			}

			return {
				fn : fn,
				deps : deps,
				configured : false
			};
		}

		function resolve(container, str) {

			var temp = container[str];

			if (temp && !temp.configured) {

				container[str].fn = getDependencies(temp, str);

				return container[str].fn;
			}
			else if (temp && temp.fn) {
				return temp.fn;
			}
		}

		function getDependencies(mod) {

			var deps = [];
			var fn = mod.fn;
			var i = 0;
			var temp = null;

			for (i=0;i<mod.deps.length;i++) {

				temp = mod.deps[i];

				if (isString(temp)) {

					deps.push(resolve(modules, temp));
				}
				else if (isFunction(temp)) {
					fn = temp;
				}
			}

			if (fn) {
				mod.configured = true;
				return fn.apply(window, deps);
			}

			return null;
		}

		function prepModules() {

			var key = null;

			for (key in modules) {
				resolve(modules, key);
			}
		}

		function resolveViews() {

			var key = null;

			for (key in views) {
				resolve(views, key);
			}
		}

		function clearRunQueue() {

			runQueue.forEach(function(mod) {
				getDependencies(mod);
			});
		}

		function clearConfigQueue() {

			configQueue.forEach(function(mod) {
				getDependencies(mod);
			});
		}

		function clearInjectorQueue() {

			injectorQueue.forEach(function(mod) {
				getDependencies(mod);
			});
		}

		/*
		* Overrides the default run loop
		* Builds modules and views without performing app config.
		*
		* @method override
		*/
		function override() {

			var key = null;

			prepModules();
			resolveViews();

			isReady = true;
			injectorQueue = [];
			runQueue = [];
		}

		function run() {

			if (isReady) {
				return;
			}

			var key = null;

			prepModules();

			clearConfigQueue();
			clearRunQueue();

			resolveViews();

			clearInjectorQueue();

			isReady = true;
			injectorQueue = [];
			runQueue = [];
		}

		function compile(ctx) {

			var key = null;
			var ctx = ctx || global.document;
			var $ctx = $(ctx);
			var search;

			var compileViews = [];

			if (!ctx) {
				throw new Error('ERROR: compile must have an element to compile.');
			}

			for (key in views) {

				search = toDash(key);

				if ($ctx.hasClass(search)) {
					compileViews.push({
						fn : views[key].fn.bind(null, $ctx[0]),
						attrs : $ctx.data()
					});
				}

				$ctx.find('.' + search).each(function() {

					compileViews.push({
						fn : views[key].fn.bind(null, this),
						attrs : $(this).data()
					});
				});

				if ($ctx.attr(search)) {
					compileViews.push({
						fn : views[key].fn.bind(null, $ctx[0]),
						attrs : $ctx.data()
					});
				}

				$ctx.find('[' + search + ']').each(function() {
					compileViews.push({
						fn : views[key].fn.bind(null, this),
						attrs : $(this).data()
					});
				});
			}

			return function(scope) {

				var i = 0;
				var temp = scope || null;

				for (i=0;i<compileViews.length;i++) {

					if (!temp) {

						inject('scope', function(appScope) {
							temp = appScope;
						});
					}

					new compileViews[i].fn(temp, compileViews[i].attrs);
				}

				return $ctx;
			}
		}

		return {
			view : view,
			module : module,
			inject : inject,
			compile : compile,
			config : _configQueue,
			run : _runQueue,
			override : override,
			start : run
		};
	}

	function App() {

		var injector = Injector();

		injector.module('inject', function() {
			injector.inject
		});

		injector.module('utility', function() {

			var utility = {};

			utility.size = size;
		    utility.isUndefined = isUndefined;
		    utility.isDefined = isDefined;
		    utility.isObject = isObject;
		    utility.isString = isString;
		    utility.isNumber = isNumber;
		    utility.isDate = isDate;
		    utility.isArray = isArray;
		    utility.isFunction = isFunction;
		    utility.isBoolean = isBoolean;
		    utility.toDash = toDash;

			return utility;
		});

		/*
		* Ladies and Gentlemen,
		* Start your engines.
		*/
		$(function() {
			injector.start();
			injector.compile()();
		});

		return {
			view : injector.view,
			module : injector.module,
			inject : injector.inject,
			compile : injector.compile,
			run : injector.run,
			config : injector.config,
			override : injector.override
		}
	}

	dip.app = function(name) {

		if (!apps[name]) {
			apps[name] = App();
		}
		
		return apps[name];
	};

}(window, window.jQuery));