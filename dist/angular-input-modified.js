(function (window, angular) {

  'use strict';

  // Registering Angular.js module.
  angular.module('ngInputModified', [])
    .directive('bsModifiable', ModifiableDirective)
    .directive('ngModel', ModifiableBehaviorDirective)
    .provider('inputModifiedConfig', ConfigProvider)
  ;

  /**
   * This directive extends ng-model with modifiable behavior.
   *
   * @constructor
   * @param {object} $animate
   * @param {object} inputModifiedConfig
   *
   * @returns {object}
   */
  function ModifiableBehaviorDirective ($animate, inputModifiedConfig) {

    // Shortcut.
    var config = inputModifiedConfig;

    return {
      restrict: 'A',
      require: ['?ngModel', '?^form', '?^bsModifiable'],
      link: function ($scope, $element, attrs, controllers) {

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

        // This behavior is applied only when form element or
        // one of it's parents has a bsModifiable directive present
        // or when global switch is set.
        if (!config.enabledGlobally && !bsModifiable) {
          return;
        }

        if (ngForm && !isFormControllerInitialized(ngForm)) {
          initializeForm(ngForm);
        }

        // Flag to indicate that master value was initialized.
        var masterValueIsSet = false;

        // Saving handle to original set-pristine method.
        var originalSetPristine = ngModel.$setPristine;

        // Replacing original set-pristine with our own.
        ngModel.$setPristine = setPristine;

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

        ngModel.reset = reset;

        // Watching for model value changes.
        $scope.$watch(modelPath, onInputValueChanged);


        /**
         * Sets proper modification state for model controller according to
         * current/master value.
         */
        function onInputValueChanged () {

          initializeMasterValue();

          var modified = !compare(ngModel.$modelValue, ngModel.masterValue);

          // If modified flag has changed.
          if (ngModel.modified !== modified) {

            // Setting new flag.
            ngModel.modified = modified;

            updateFormModifiedStateByModel(ngForm, ngModel);

            // Re-decorating the element.
            updateCssClasses();
          }
        }

        /**
         * Initializes master value if required.
         */
        function initializeMasterValue () {

          if (masterValueIsSet) {
            return;
          }

          // Initializing the master value.
          ngModel.masterValue = ngModel.$modelValue;

          // Initially decorating the element.
          updateCssClasses();

          masterValueIsSet = true;
        }

        /**
         * Decorates element with proper CSS classes.
         */
        function updateCssClasses () {
          $animate.addClass($element, (ngModel.modified ? config.modifiedClassName : config.notModifiedClassName));
          $animate.removeClass($element, (ngModel.modified ? config.notModifiedClassName : config.modifiedClassName));
        }

        /**
         * Overloading original set-pristine method.
         */
        function setPristine () {

          // Calling overloaded method.
          originalSetPristine.apply(this, arguments);

          setMasterValue(ngModel.$modelValue);
        }

        /**
         * Sets new master value.
         *
         * @param {*} newMasterValue
         */
        function setMasterValue (newMasterValue) {

          // Updating parameters.
          ngModel.masterValue = newMasterValue;
          ngModel.modified = false;

          // Making sure form state is updated.
          updateFormModifiedStateByModel(ngForm, ngModel);

          // Re-decorating the element.
          updateCssClasses();
        }

        /**
         * Replaces current input value with a master value.
         */
        function reset () {
          try {
            eval('$scope.' + modelPath + ' = ngModel.masterValue;');
          } catch (exception) {
            // Missing specified model. Do nothing.
          }
        }

      }
    };
  }

  /**
   * This directive doesn't add any functionality,
   * it serves as a mere marker for main directive.
   *
   * @constructor
   *
   * @returns {object}
   */
  function ModifiableDirective () {
    return {
      restrict: 'A',
      controller: function () {
      }
    };
  }

  /**
   * Factory that creates configuration service.
   *
   * @returns {object}
   * @constructor
   */
  function ConfigProvider () {

    // Default config.
    var config = {
      enabledGlobally: true,
      modifiedClassName: 'ng-modified',
      notModifiedClassName: 'ng-not-modified'
    };

    return {
      enableGlobally: function () {
        config.enabledGlobally = true;
        return this;
      },
      disableGlobally: function () {
        config.enabledGlobally = false;
        return this;
      },
      setModifiedClassName: function (modifiedClassName) {
        config.modifiedClassName = String(modifiedClassName);
        return this;
      },
      setNotModifiedClassName: function (notModifiedClassName) {
        config.notModifiedClassName = String(notModifiedClassName);
        return this;
      },
      $get: function () {
        return config;
      }
    };
  }

  /**
   * Updating form when input is modified.
   *
   * @param {object} ngForm
   * @param {object} ngModel
   */
  function updateFormModifiedStateByModel (ngForm, ngModel) {

    if (!ngForm) {
      // No need to do anything if form controller is missing.
      return;
    }

    var listIndex = ngForm.modifiedModels.indexOf(ngModel);
    var presentInList = (-1 !== listIndex);

    if (ngModel.modified && !presentInList) {

      // Adding model to the internal list of modified models.
      ngForm.modifiedModels.push(ngModel);

      // Increasing number of modified models.
      ngForm.modifiedCount++;

    } else if (!ngModel.modified && presentInList) {

      // Removing model from the internal list of modified models.
      ngForm.modifiedModels.splice(listIndex, 1);

      // Decreasing number of modified models.
      ngForm.modifiedCount--;
    }

    // Form is considered modified when it has at least one modified element.
    ngForm.modified = (ngForm.modifiedCount > 0);
  }

  /**
   * Returns true if specified parameter is Angular model controller,
   * false otherwise.
   *
   * @param {*} ngModel
   *
   * @returns {boolean}
   */
  function isModelController (ngModel) {
    return (
         'object' === typeof ngModel
      && '$modelValue' in ngModel
    );
  }

  /**
   * Returns true if specified parameters is Angular form controller,
   * false otherwise.
   *
   * @param {*} ngForm
   *
   * @returns {boolean}
   */
  function isFormController (ngForm) {
    return (
         'object' === typeof ngForm
      && '$submitted' in ngForm
    );
  }

  /**
   * Returns true if specified form controller is initialized, false otherwise.
   *
   * @param {object} ngForm
   *
   * @returns {boolean}
   */
  function isFormControllerInitialized (ngForm) {
    return ('undefined' !== typeof ngForm.modified);
  }

  /**
   * Returns true if specified parameter is initialized model controller,
   * false otherwise.
   *
   * @param {*} ngModel
   *
   * @returns {boolean}
   */
  function isModelControllerInitialized (ngModel) {
    return ('modified' in ngModel);
  }

  /**
   * Iterates child model controllers of specified form controller,
   * calls specified iterator for every model controller.
   *
   * @param {object} ngForm
   * @param {function} iterator
   */
  function iterateFormElements (ngForm, iterator) {
    angular.forEach(ngForm, function (element) {
      if (isModelController(element)) {
        iterator(element);
      }
    });
  }

  /**
   * Iterates form parents.
   *
   * @param {object} ngForm
   * @param {function} iterator
   */
  function iterateFormParents (ngForm, iterator) {
    var isActualForm;
    do {
      ngForm = ngForm.$$parentForm;
      isActualForm = isFormController(ngForm);
      if (isActualForm) {
        iterator(ngForm);
      }
    } while (isActualForm);
  }

  /**
   * Initializes specified form controller.
   *
   * @param {object} ngForm
   */
  function initializeForm (ngForm) {

    ngForm.modified = false;

    // Modified models.
    ngForm.modifiedCount = 0;
    ngForm.modifiedModels = [];

    // Modified child forms.
    ngForm.modifiedChildFormsCount = 0;
    ngForm.modifiedChildForms = [];

    ngForm.reset = resetForm;
  }

  /**
   * Resets all form inputs to it's master values.
   */
  function resetForm (ngForm) {
    ngForm = ngForm || this;
    iterateFormElements(ngForm, function (ngModel) {
      if (isModelControllerInitialized(ngModel)) {
        ngModel.reset();
      }
    });
  }

  /**
   * Returns true if specified values are equal, false otherwise.
   * Supports dates comparison.
   *
   * @param {*} value1
   * @param {*} value2
   *
   * @returns {boolean}
   */
  function compare (value1, value2) {
    value1 = normalizeValue(value1);
    value2 = normalizeValue(value2);

    if ('object' === typeof value1 && 'object' === typeof value2) {
      if (value1 instanceof Date && value2 instanceof Date) {
        // Comparing two dates.
        return (value1.getTime() === value2.getTime());
      } else {
        // Comparing two objects.
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
  function normalizeValue (value) {
    return (undefined === value || '' === value ? null : value);
  }

})(window, angular);
