(function(exports) {

	'use strict';

	function isDefined(value) {
		return typeof value != 'undefined';
	}

	function isString(value) {
        return typeof value == 'string';
    }

    function isArray(value) {
        return toString.apply(value) == '[object Array]';
    }

    function isFunction(value) {
        return typeof value == 'function';
    }

    function toDash(str) {

		return str.replace(/([A-Z])/g, function($1) {
			return "-"+$1.toLowerCase();
		});
	}

	function Dip() {

		/*
		* Just a hash to store our modules
		*/
		var modules = {};

		/*
		* Registers the module then attaches a selector.
		* Selectors must be class names, creating by converting
		* the module name to dash case
		*/
		function view(name, arr) {
			module(name, arr).selector = toDash(name);
		}

		/*
		* Registers the module.
		* @param name - a name for the module
		* @param arr - an array of dependencies and the 
		* invocation funciton or just the invocation function.
		*/
		function module(name, arr) {

			var fn = null;
			var deps = [];

			if (modules[name]) {
				throw new Error('Module already exists');
			}
			else {

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

				modules[name] = {
					fn : fn,
					deps : deps,
					configured : false
				};
			}

			return modules[name];
		}

		function resolve(str) {

			var temp = modules[str];

			if (temp && !temp.configured) {

				modules[str].fn = getDependencies(temp, str);

				return modules[str].fn;
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

					deps.push(resolve(temp));
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

				resolve(key);

				if (modules[key].selector) {

					$('.' + modules[key].selector).each(function() {
						new modules[key].fn(this);
					});
				}
			}
		}

		/*
		* Labies and Gentlemen,
		* Start your engines.
		*/
		$(run);

		return {
			view : view,
			module : module
		};
	}

	exports.Dip = Dip;

}(window, window.jQuery));