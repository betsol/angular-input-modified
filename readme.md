# angular-input-modified 1.1.1

This AngularJS module adds additional properties and methods to the `ngModel` and `ngForm` controllers
to provide end-user with facilities to detect and indicate form input modifications.

This extra functionality allows you to provide better usability for forms.
For example, you can add decorations to the form elements that are actually changed.
That way, user will see what values has changed since last edit.

Also, you can reset form to it's initial state (cancel all user edits) with just a single call to `form.reset()` or
lock new values (preserve new state) just by calling `form.$setPristine()`.
If you want, you can do this for individual input elements the same way.

Please see [the Demo][demo].

---

## Decorations and animation

This module adds `ng-modified` and `ng-not-modified` CSS classes to the input fields to indicate their state.
Use them in your CSS to decorate input fields. You can combine multiple classes in the same selector.
For example this is the useful CSS selector to decorate as valid only modified elements: `input.ng-valid.ng-modified`.
This way target user will see what elements were actually changed.

### Example

``` css
/** Decorating only modified inputs as valid */
input.ng-valid.ng-modified {
    border-color: green;
}
```

It also supports animations if `ngAnimate` module is present.

---

## API

### ngModel

{\*} **masterValue** -
initial value of the input field.

{boolean} **modified** -
flag that indicates whether the input value was modified.

**reset()** - 
method to reset input value to it's initial state.

### ngForm

{integer} **modifiedCount** -
number of modified input types inside of the form.

{boolean} **modified** -
flag that indicates whether the form is modified (i.e. at least one element is modified).

{string[]} **modifiedModels** -
list of names for modified models.

**reset()** - 
method to reset all input values of the form to their initial states.

---

## Installation

### Install library with bower

`bower install --save angular-input-modified`

### Add library to your page

``` html
<script type="text/javascript" src="angular-input-modified/src/angular-input-modified.js"></script>
```

### Add dependency in your application's module definition

``` javascript
var application = angular.module('application', [
    // ...
    'ngInputModified'
]);
```

---

## Usage

Please see [the demo][demo] for all usage details. It has all the examples.

---

## Feedback

If you have found a bug or have another issue with the library - please [create an issue][new-issue] in this GitHub repository.

If you have a question - file it with [StackOverflow][so-ask] and send me a
link to [s.fomin@betsol.ru][email]. I will be glad to help.
Also, please add a [JSFiddle][jsfiddle] to demonstrate the issue if appropriate.
You can even fork our [demo fiddle][demo].

Have any ideas or propositions? Feel free to contact me by the same [E-Mail address][email].

Cheers!

---

## License

The MIT License (MIT)

Copyright (c) 2014 Slava Fomin II

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

[so-ask]: http://stackoverflow.com/questions/ask?tags=angularjs,javascript
[email]: mailto:s.fomin@betsol.ru
[jsfiddle]: http://jsfiddle.net/
[demo]: http://jsfiddle.net/slavafomin/R6Yhx/
[new-issue]: https://github.com/betsol/angular-input-modified/issues/new
