(function (window, angular) {

  'use strict';

  // Registering Angular.js module.
  angular.module('ngInputModified', [])
    .directive('bsModifiable', ModifiableDirective)
  ;

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

})(window, angular);

(function (window, angular) {

  'use strict';

  // Extending Angular.js module.
  angular.module('ngInputModified')
    .provider('inputModifiedConfig', configProviderFactory)
  ;

  /**
   * Factory that creates configuration service.
   *
   * @returns {object}
   * @constructor
   */
  function configProviderFactory () {

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

})(window, angular);

(function (window, angular) {

  'use strict';

  // Extending Angular.js module.
  angular.module('ngInputModified')
    .directive('form', ['$animate', 'inputModifiedConfig', function ($animate, inputModifiedConfig) {
      return formDirectiveFactory($animate, inputModifiedConfig, false);
    }])
    .directive('ngForm', ['$animate', 'inputModifiedConfig', function ($animate, inputModifiedConfig) {
      return formDirectiveFactory($animate, inputModifiedConfig, true);
    }])
  ;

  function formDirectiveFactory ($animate, inputModifiedConfig, isNgForm) {

    // Shortcut.
    var config = inputModifiedConfig;

    return {
      name: 'form',
      restrict: isNgForm ? 'EAC' : 'E',
      require: ['?form', '?^form'],
      link: function ($scope, $element, attrs, controllers) {

        // Handling controllers.
        var formCtrl = controllers[0];
        //var parentFormCtrl = controllers[1];

        // Form controller is required for this directive to operate.
        // Parent form is optional.
        if (!formCtrl) {
          return;
        }

        formCtrl.modified = false;

        // Modified models.
        formCtrl.modifiedCount = 0;
        formCtrl.modifiedModels = [];

        // Modified child forms.
        formCtrl.modifiedChildFormsCount = 0;
        formCtrl.modifiedChildForms = [];

        formCtrl.reset = reset;

        formCtrl.$$notifyModelModifiedStateChanged = onModelModifiedStateChanged;


        /**
         * Resets all form inputs to it's master values.
         */
        function reset () {
          iterateFormElements(formCtrl, function (modelCtrl) {
            if (isModifiableModel(modelCtrl)) {
              modelCtrl.reset();
            }
          });
        }

        /**
         * Updating form when child model's modified state has changed.
         * Child models will call this method internally.
         *
         * @param {object} modelCtrl
         */
        function onModelModifiedStateChanged (modelCtrl) {

          var listIndex = formCtrl.modifiedModels.indexOf(modelCtrl);
          var presentInList = (-1 !== listIndex);

          if (modelCtrl.modified && !presentInList) {

            // Adding model to the internal list of modified models.
            formCtrl.modifiedModels.push(modelCtrl);

            // Increasing number of modified models.
            formCtrl.modifiedCount++;

          } else if (!modelCtrl.modified && presentInList) {

            // Removing model from the internal list of modified models.
            formCtrl.modifiedModels.splice(listIndex, 1);

            // Decreasing number of modified models.
            formCtrl.modifiedCount--;
          }

          // Form is considered modified when it has at least one modified element.
          formCtrl.modified = (formCtrl.modifiedCount > 0);

          updateCssClasses();
        }

        /**
         * Decorates element with proper CSS classes.
         */
        function updateCssClasses () {
          $animate.addClass($element, (formCtrl.modified ? config.modifiedClassName : config.notModifiedClassName));
          $animate.removeClass($element, (formCtrl.modified ? config.notModifiedClassName : config.modifiedClassName));
        }

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
  function isModelController (ngModel) {
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
  function isModifiableModel (ngModel) {
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

})(window, angular);

(function (window, angular) {

  'use strict';

  // Extending Angular.js module.
  angular.module('ngInputModified')
    .directive('ngModel', ngModelModifiedFactory)
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
  function ngModelModifiedFactory ($animate, inputModifiedConfig) {

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
        var modelCtrl = controllers[0];
        var formCtrl = controllers[1];
        var bsModifiable = controllers[2];

        // Model controller is required for this directive to operate.
        // Parent form controller is optional.
        if (!modelCtrl) {
          return;
        }

        // This behavior is applied only when form element or
        // one of it's parents has a bsModifiable directive present
        // or when global switch is set.
        if (!config.enabledGlobally && !bsModifiable) {
          return;
        }

        // Flag to indicate that master value was initialized.
        var masterValueIsSet = false;

        // Saving handle to original set-pristine method.
        var originalSetPristine = modelCtrl.$setPristine;

        // Replacing original set-pristine with our own.
        modelCtrl.$setPristine = setPristine;

        modelCtrl.modified = false;

        modelCtrl.masterValue = undefined;

        modelCtrl.reset = reset;

        // Watching for model value changes.
        $scope.$watch(modelPath, onInputValueChanged);


        /**
         * Sets proper modification state for model controller according to
         * current/master value.
         */
        function onInputValueChanged () {

          initializeMasterValue();

          var modified = !compare(modelCtrl.$modelValue, modelCtrl.masterValue);

          // If modified flag has changed.
          if (modelCtrl.modified !== modified) {

            // Setting new flag.
            modelCtrl.modified = modified;

            // Notifying the form.
            formCtrl.$$notifyModelModifiedStateChanged(modelCtrl);

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
          modelCtrl.masterValue = modelCtrl.$modelValue;

          // Initially decorating the element.
          updateCssClasses();

          masterValueIsSet = true;
        }

        /**
         * Decorates element with proper CSS classes.
         */
        function updateCssClasses () {
          $animate.addClass($element, (modelCtrl.modified ? config.modifiedClassName : config.notModifiedClassName));
          $animate.removeClass($element, (modelCtrl.modified ? config.notModifiedClassName : config.modifiedClassName));
        }

        /**
         * Overloading original set-pristine method.
         */
        function setPristine () {

          // Calling overloaded method.
          originalSetPristine.apply(this, arguments);

          setMasterValue(modelCtrl.$modelValue);
        }

        /**
         * Sets new master value.
         *
         * @param {*} newMasterValue
         */
        function setMasterValue (newMasterValue) {

          // Updating parameters.
          modelCtrl.masterValue = newMasterValue;
          modelCtrl.modified = false;

          // Notifying the form.
          formCtrl.$$notifyModelModifiedStateChanged(modelCtrl);

          // Re-decorating the element.
          updateCssClasses();
        }

        /**
         * Replaces current input value with a master value.
         */
        function reset () {
          try {
            eval('$scope.' + modelPath + ' = modelCtrl.masterValue;');
          } catch (exception) {
            // Missing specified model. Do nothing.
          }
        }

      }
    };
  }
  ngModelModifiedFactory.$inject = ['$animate', 'inputModifiedConfig'];

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
