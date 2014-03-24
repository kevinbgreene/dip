(function(exports) {

	'use strict';

	var dip = {};
	var apps = {};

	exports.dip = dip;

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
		var queue = [];

		var isReady = false;

		/*
		* @description takes an array of dependencies and injects them into a function
		* @param {array} arr - array of dependencies
		* @param {function} fn - invocation function
		*/
		function inject(arr, fn) {

			var mod = {
				deps : arr,
				fn : fn
			};

			if (!isReady) {
				queue.push(mod);
			}
			else {
				getDependencies(mod);
			}

			return this;
		}

		/*
		* Registers the view.
		* @method view
		* @param {string} name - a name for the module
		* @param {array | function} arr - an array of dependencies and the 
		* invocation funciton or just the invocation function. Selectors 
		* must be class names, creating by converting
		* the module name to dash case
		*/
		function view(name, arr) {

			if (isUndefined(arr)) {
				return views[name] || null;
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
		* @method module
		* @param {string} name - a name for the module
		* @param {array | function} arr - an array of dependencies and the 
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

		function run() {

			var key = null;

			for (key in modules) {
				resolve(modules, key);
			}

			for (key in views) {
				resolve(views, key);
			}

			queue.forEach(function(mod) {
				getDependencies(mod);
			});

			isReady = true;
			queue = [];
		}

		function compile(scope) {

			var key = null;

			for (key in views) {

				$('.' + toDash(key)).each(function() {
					new views[key].fn(this, scope);
				});

				$('[' + toDash(key) + ']').each(function() {
					new views[key].fn(this, scope);
				});
			}
		}

		return {
			view : view,
			module : module,
			inject : inject,
			run : run,
			compile : compile
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

			injector.run();

			injector.inject(['scope'], injector.compile);

		});

		return {
			view : injector.view,
			module : injector.module,
			inject : injector.inject
		}
	}

	dip.app = function(name) {

		if (!apps[name]) {
			apps[name] = App();
		}
		
		return apps[name];
	};

}(window));