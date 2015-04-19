(function (window, angular) {

  'use strict';

  // Extending Angular.js module.
  angular.module('ngInputModified')
    .directive('form', function ($animate, inputModifiedConfig) {
      return formDirectiveFactory($animate, inputModifiedConfig, false);
    })
    .directive('ngForm', function ($animate, inputModifiedConfig) {
      return formDirectiveFactory($animate, inputModifiedConfig, true);
    })
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
