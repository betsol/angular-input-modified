/**
 * AngularJS module "angular-input-modified".
 *
 * @version 1.1.5
 * @author Slava Fomin II <s.fomin@betsol.ru>
 * @licence MIT
 * @copyright Slava Fomin II, Better Solutions, 2014
 */
(function(window, angular) {

    'use strict';

    var modifiedClassName = 'ng-modified';
    var notModifiedClassName = 'ng-not-modified';

    var directiveSpecification = ['$animate', inputModifiedDirective];

    // Registering AngularJS module.
    angular.module('ngInputModified', ['ng'])
        .directive('input',    directiveSpecification)
        .directive('textarea', directiveSpecification)
        .directive('select',   directiveSpecification)
    ;

    function inputModifiedDirective($animate)
    {
        return {
            restrict: 'E',
            require: ['?ngModel', '?^form'],
            link: function($scope, $element, attrs, controllers) {

                var modelName = attrs.ngModel;

                // Handling controllers.
                var ngModel = controllers[0];
                var ngForm = controllers[1];

                // ngModel is required for this directive to operate.
                // ngForm is optional.
                if ('undefined' === typeof ngModel) {
                    return;
                }

                /**
                 * Decorates element with proper CSS classes.
                 */
                var toggleCssClasses = function() {
                    $animate.addClass($element, (ngModel.modified ? modifiedClassName : notModifiedClassName));
                    $animate.removeClass($element, (ngModel.modified ? notModifiedClassName : modifiedClassName));
                };

                /**
                 * This handler is called when form element is modified.
                 *
                 * @param {string} modelName
                 * @param {boolean} modified
                 */
                var onElementModified = function(modelName, modified) {

                    // Updating form when one of the inputs is modified.
                    if (ngForm) {
                        var index = ngForm.modifiedModels.indexOf(modelName);
                        var exists = (-1 !== index);

                        if (modified && !exists) {
                            // Adding model name to the list of modified models.
                            ngForm.modifiedModels.push(modelName);
                            ngForm.modifiedCount++;
                        } else if (!modified && exists) {
                            // Removing model name from the list of modified models.
                            ngForm.modifiedModels.splice(index, 1);
                            ngForm.modifiedCount--;
                        }

                        // Form is considered modified when it has at least one modified element.
                        ngForm.modified = (ngForm.modifiedCount > 0);
                    }
                };

                /**
                 * Sets proper modification state for model controller according to current and master value.
                 */
                var onInputValueChanged = function() {

                    // If master value is not set.
                    if ('undefined' === typeof ngModel.masterValue) {

                        // Initializing the master value.
                        ngModel.masterValue = ngModel.$modelValue;

                        // Initially decorating the element.
                        toggleCssClasses();

                    } else {

                        // Comparing current input value with preserved master value
                        // to determine if it's changed.
                        var modified = !valuesEqual(ngModel.$modelValue, ngModel.masterValue);

                        // If modified flag is changed.
                        if (ngModel.modified !== modified) {

                            onElementModified(modelName, modified);

                            // Setting new flag.
                            ngModel.modified = modified;

                            // Re-decorating the element.
                            toggleCssClasses();
                        }
                    }
                };

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
                 * @type {*}
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

                    // Making sure form state is updated.
                    onElementModified(modelName, false);

                    // Re-decorating the element.
                    toggleCssClasses();
                };

                /**
                 * Resets input value to the master.
                 */
                ngModel.reset = function() {
                    eval('$scope.' + modelName + ' = ngModel.masterValue;');
                };

                // If parent form element is present for this input and
                // is not yet initialized.
                if (ngForm && !isFormInitialized(ngForm)) {
                    initializeForm(ngForm);
                }

                // Watching for model value changes.
                $scope.$watch(modelName, onInputValueChanged);
            }
        };
    }

    /**
     * Returns true if specified parameter is Angular model controller,
     * false otherwise.
     *
     * @param {*} ngModel
     *
     * @returns {boolean}
     */
    function isModelController(ngModel) {
        return (
               'object' === typeof ngModel
            && '$modelValue' in ngModel
        );
    }

    /**
     * Returns true if specified parameter is initialized model controller,
     * false otherwise.
     *
     * @param {*} ngModel
     *
     * @returns {boolean}
     */
    function isModelControllerInitialized(ngModel) {
        return ('modified' in ngModel);
    }

    /**
     * Iterates child model controllers of specified form controller,
     * call specified iterator with every model controller.
     *
     * @param {object} ngForm
     * @param {function} iterator
     */
    function iterateFormElements(ngForm, iterator) {
        angular.forEach(ngForm, function(element) {
            if (isModelController(element)) {
                iterator(element);
            }
        });
    }

    /**
     * Initializes specified form controller.
     *
     * @param {object} ngForm
     */
    function initializeForm(ngForm) {

        ngForm.modified = false;
        ngForm.modifiedCount = 0;

        // List of modified models.
        ngForm.modifiedModels = [];

        /**
         * Resets all form inputs to it's master values.
         */
        ngForm.reset = function() {
            iterateFormElements(ngForm, function(ngModel) {
                if (isModelControllerInitialized(ngModel)) {
                    ngModel.reset();
                }
            });
        };
    }

    /**
     * Returns true if specified form controller is initialized, false otherwise.
     *
     * @param {object} ngForm
     *
     * @returns {boolean}
     */
    function isFormInitialized(ngForm) {
        return ('undefined' !== typeof ngForm.modified);
    }

    /**
     * Returns true if specified values are equal, false otherwise.
     * Supports date comparison.
     *
     * @param {*} value1
     * @param {*} value2
     *
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
            } else {
                // Comparing two generic objects using strong comparison.
                return (value1 === value2);
            }
        }

        // In all other cases using weak comparison.
        return (value1 == value2);
    }

    /**
     * Casting all null-like values to actual null for guaranteed comparison.
     *
     * @param {*} value
     *
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
