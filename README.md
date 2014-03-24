# dip

A very simple dependency injector. Maybe I'll do more with it, but for now just something I'm playing with.

## Usage

Dip exposes one global variable, "Dip", and has one dependency, jQuery.

Create a new instance of dip...

     var app = dip.app('app');

The first time dip.app is called with a given name it creates a new dip app instance and returns it, each subsequent call to dip.app with that name returns the instance created with the first call.

There are three public methods, module and view for defining different kinds of modules and inject for injecting dependencies into a function without creating a new module.

The name you pass to view is converted to dash case and used as a selector to find elements by that class name, the elements are then passed into the function returned by the view module.

Create a module.

     dip.module(name, [dep, dep, fn]);

Create a view.

     dip.view(name, [dep, dep, fn]);

Inject dependencies into a funciton without creating a new module.

     dip.inject([dep], fn]);