(function(window, angular) {
    'use strict';

    var modifiedClassName = 'ng-modified';
    var notModifiedClassName = 'ng-not-modified';

    var inputModifiedDirectiveSpecification = ['$animate', inputModifiedDirective];

    // Registering AngularJS module.
    angular.module('ngInputModified', ['ng'])
        .directive('input',    inputModifiedDirectiveSpecification)
        .directive('textarea', inputModifiedDirectiveSpecification)
        .directive('select',   inputModifiedDirectiveSpecification)
    ;

    function inputModifiedDirective($animate)
    {
        return {
            restrict: 'E',
            require: ['?ngModel', '?^form'],
            link: function($scope, $element, attrs, controllers) {

                // Handling controllers.
                var ngModel = controllers[0];
                var ngForm = controllers[1];

                // ngModel is required for this directive to operate.
                // ngForm is optional.
                if (null === ngModel) {
                    return;
                }

                // Saving handle to original $setPristine method.
                var originalSetPristine = ngModel.$setPristine;

                /**
                 * This flag will show if input value was modified.
                 *
                 * @type {boolean}
                 */
                ngModel.modified = false;

                /**
                 * This property contains current master value for this input field.
                 *
                 * @type {undefined}
                 */
                ngModel.masterValue = undefined;

                /**
                 * Augmentation for original $setPristine method.
                 */
                ngModel.$setPristine = function() {
                    // Calling original $setPristine method.
                    originalSetPristine.apply(this, arguments);

                    // Updating parameters.
                    ngModel.masterValue = ngModel.$modelValue;
                    ngModel.modified = false;

                    // Re-decorating the element.
                    toggleCssClasses();
                };

                /**
                 * Resets input value to the master.
                 */
                ngModel.reset = function() {
                    eval('$scope.' + attrs.ngModel + ' = ngModel.masterValue;');
                };

                // If parent form element is present for this input.
                if (ngForm) {
                    /**
                     * Resets all form inputs to it's master values.
                     */
                    ngForm.reset = function() {
                        angular.forEach(ngForm, function(element) {
                            if (
                                   'undefined' !== typeof element.$modelValue
                                && 'function'  === typeof element.reset
                            ) {
                                element.reset();
                            }
                        });
                    };

                    ngForm.modified = false;
                    ngForm.modifiedCount = 0;
                }

                /**
                 * Decorates element with proper CSS classes.
                 */
                var toggleCssClasses = function()
                {
                    $animate.addClass($element, (ngModel.modified ? modifiedClassName : notModifiedClassName));
                    $animate.removeClass($element, (ngModel.modified ? notModifiedClassName : modifiedClassName));
                }

                /**
                 * Flag to determine if this is the first call.
                 *
                 * @type {boolean}
                 */
                var initial = true;

                // Watching for model value changes.
                $scope.$watch(attrs.ngModel, function(value) {
                    // If master value is not set.
                    if (initial) {
                        // Preserving master value.
                        ngModel.masterValue = value;
                        // Initially decorating the element.
                        toggleCssClasses();

                    } else {
                        // Comparing current input value with preserved master value
                        // to determine if it's changed.
                        var modified = !valuesEqual(value, ngModel.masterValue);

                        // If modified flag is changed.
                        if (ngModel.modified !== modified) {

                            if (ngForm) {
                                ngForm.modifiedCount += (modified ? 1 : -1);
                                ngForm.modified = (ngForm.modifiedCount > 0);
                            }

                            // Setting new flag.
                            ngModel.modified = modified;
                            // Re-decorating the element.
                            toggleCssClasses();
                        }
                    }

                    // Disabling initial flag in the end of first run.
                    if (initial) {
                        initial = false;
                    }
                });
            }
        };
    }

    /**
     * Returns true if specified values are equal, false otherwise.
     * Supports date comparison.
     *
     * @param {*} value1
     * @param {*} value2
     * @returns {boolean}
     */
    function valuesEqual(value1, value2)
    {
        value1 = unifyValue(value1);
        value2 = unifyValue(value2);

        if ('object' === typeof value1 && 'object' === typeof value2) {
            if (value1 instanceof Date && value2 instanceof Date) {
                // Comparing two dates.
                return (value1.getTime() === value2.getTime());
            }
        }

        // In all other cases.
        return (value1 === value2);
    }

    /**
     * Casting all null-like values to actual null for guaranteed comparison.
     *
     * @param {*} value
     * @returns {*}
     */
    function unifyValue(value)
    {
        if (undefined === value) {
            return null;
        }

        if ('' === value) {
            return null;
        }

        return value;
    }

})(window, angular);