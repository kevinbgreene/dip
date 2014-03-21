# dip

A very simple dependency injector. Maybe I'll do more with it, but for now just something I'm playing with.

## Usage

Dip exposes one global variable, "Dip", and has one dependency, jQuery.

Create a new instance of dip...

var dip = Dip();

There are two public methods, module and view for defining different kinds of modules.

The name you pass to view is converted to camel case and used as a selector to find elements by that class name, the elements are then passed into the function returned by the view module.

dip.module(name, [dep, dep, fn]);

dip.view(name, [dep, dep, fn]);