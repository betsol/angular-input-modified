(function(window, angular) {

    'use strict';

    var ModifiableBehaviorDirective = ['$animate', 'inputModifiedConfig', function($animate, config)
    {
        return {
            restrict: 'A',
            require: ['?ngModel', '?^form', '?^bsModifiable'],
            link: function($scope, $element, attrs, controllers) {

                /**
                 * Path to a model variable inside the scope.
                 * It can be as simple as: "foo" or as complex as "foo.bar[1].baz.qux".
                 */
                var modelPath = attrs.ngModel;

                // Handling controllers.
                var ngModel = controllers[0];
                var ngForm = controllers[1];
                var bsModifiable = controllers[2];

                // ngModel is required for this directive to operate.
                // ngForm is optional.
                if (!ngModel) {
                    return;
                }

                // This behavior is applied only when form element or one of it's parents has a bsModifiable directive present
                // or when global switch is set.
                if (!config.enabledGlobally && !bsModifiable) {
                    return;
                }

                /**
                 * Decorates element with proper CSS classes.
                 */
                var toggleCssClasses = function() {
                    $animate.addClass($element, (ngModel.modified ? config.modifiedClassName : config.notModifiedClassName));
                    $animate.removeClass($element, (ngModel.modified ? config.notModifiedClassName : config.modifiedClassName));
                };

                /**
                 * This handler is called when form element is modified.
                 *
                 * @param {boolean} modified
                 */
                var onElementModified = function(modified) {
                    updateModifiedModelState(modified);
                };

                /**
                 * Updating form when input is modified.
                 *
                 * @param {bool} modified
                 */
                var updateModifiedModelState = function(modified) {

                    if (!ngForm) {
                        // No need to do anything if form controller is missing.
                        return;
                    }

                    var listIndex = ngForm.modifiedModels.indexOf(ngModel);
                    var presentInList = (-1 !== listIndex);

                    if (modified && !presentInList) {

                        // Adding model to the internal list of modified models.
                        ngForm.modifiedModels.push(ngModel);

                        // Increasing number of modified models.
                        ngForm.modifiedCount++;

                    } else if (!modified && presentInList) {

                        // Removing model from the internal list of modified models.
                        ngForm.modifiedModels.splice(listIndex, 1);

                        // Decreasing number of modified models.
                        ngForm.modifiedCount--;
                    }

                    // Form is considered modified when it has at least one modified element.
                    ngForm.modified = (ngForm.modifiedCount > 0);
                    
                    //Update All Parent Forms
                    var parentForm = ngForm.$$parentForm;
                    while (parentForm != null) {
                    	if (parentForm.modifiedCount == null) parentForm.modifiedCount = {};
                    	parentForm.modifiedCount[ngForm.$name] = ngForm.modifiedCount;
                    	
                    	var modifiedTotal = 0;
                    	angular.forEach(parentForm.modifiedCount, function (value, key) {
                    		modifiedTotal += value;
                    	})
                    	
                    	parentForm.modified = modifiedTotal > 0;
                    	
                    	parentForm = parentForm.$$parentForm;
                    }
                };

                // Flag to indicate that master value was initialized.
                var masterValueIsSet = false;

                /**
                 * Sets proper modification state for model controller according to current and master value.
                 */
                var onInputValueChanged = function() {

                    // If master value is not set (called only once).
                    if (!masterValueIsSet) {

                        // Initializing the master value.
                        ngModel.masterValue = ngModel.$modelValue;

                        // Initially decorating the element.
                        toggleCssClasses();

                        masterValueIsSet = true;

                    } else {

                        // Comparing current input value with preserved master value
                        // to determine if it's changed.
                        var modified = !valuesEqual(ngModel.$modelValue, ngModel.masterValue);

                        // If modified flag is changed.
                        if (ngModel.modified !== modified) {

                            onElementModified(modified);

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
                    onElementModified(false);

                    // Re-decorating the element.
                    toggleCssClasses();
                };

                /**
                 * Replaces current input value with a master value.
                 */
                ngModel.reset = function() {
                    try {
                        eval('$scope.' + modelPath + ' = ngModel.masterValue;');
                    } catch (exception) {
                        // Missing specified model. Do nothing.
                    }
                };

                // If parent form element is present for this input and
                // is not yet initialized.
                if (ngForm && !isFormInitialized(ngForm)) {
                    initializeForm(ngForm);
                }

                // Watching for model value changes.
                $scope.$watch(modelPath, onInputValueChanged);
            }
        };
    }];

    // Registering AngularJS module.
    angular.module('ngInputModified', ['ng'])
        .directive('bsModifiable', ModifiableDirective)
        .directive('ngModel', ModifiableBehaviorDirective)
        .provider('inputModifiedConfig', ConfigProvider)
    ;

    /**
     * This directive doesn't add any functionality, it serves as a marker for main directive.
     *
     * @constructor
     * @returns {object}
     */
    function ModifiableDirective()
    {
        return {
            'restrict': 'A',
            controller: function() {}
        };
    }

    function ConfigProvider()
    {
        var config = {
            enabledGlobally: true,
            modifiedClassName: 'ng-modified',
            notModifiedClassName: 'ng-not-modified'
        };

        return {
            enableGlobally: function() {
                config.enabledGlobally = true;
                return this;
            },
            disableGlobally: function() {
                config.enabledGlobally = false;
                return this;
            },
            setModifiedClassName: function(modifiedClassName) {
                config.modifiedClassName = String(modifiedClassName);
                return this;
            },
            setNotModifiedClassName: function(notModifiedClassName) {
                config.notModifiedClassName = String(notModifiedClassName);
                return this;
            },
            $get: function() {
                return config;
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
                // Comparing two objects using AngularJS equals method.
                return angular.equals(value1, value2);
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
