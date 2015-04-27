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
      require: ['?form'],
      link: function ($scope, $element, attrs, controllers) {

        // Handling controllers.
        var formCtrl = controllers[0];
        var parentFormCtrl = (formCtrl.$$parentForm || $element.parent().controller('form'));

        // Form controller is required for this directive to operate.
        // Parent form is optional.
        if (!formCtrl) {
          return;
        }

        formCtrl.modified = false;
        formCtrl.reset = reset;

        // Modified models.
        formCtrl.modifiedCount = 0;
        formCtrl.modifiedModels = [];
        formCtrl.$$notifyModelModifiedStateChanged = function (modelCtrl) {
          onModifiedStateChanged(modelCtrl, formCtrl.modifiedModels);
        };

        // Modified child forms.
        formCtrl.modifiedChildFormsCount = 0;
        formCtrl.modifiedChildForms = [];
        formCtrl.$$notifyChildFormModifiedStateChanged = function (childFormCtrl) {
          onModifiedStateChanged(childFormCtrl, formCtrl.modifiedChildForms);
        };


        /**
         * Resets all form inputs to it's master values.
         */
        function reset () {

          // Resetting modified models.
          angular.forEach(formCtrl.modifiedModels, function (modelCtrl) {
            modelCtrl.reset();
          });

          // Resetting modified child forms.
          angular.forEach(formCtrl.modifiedChildForms, function (childFormCtrl) {
            childFormCtrl.reset();
          });
        }

        /**
         * This universal function is called when child model or child form is modified
         * by the modified component itself.
         * It will update the corresponding tracking list, the number of modified components
         * and the form itself if required.
         *
         * @param ctrl  The modified model or modified form controller
         * @param list  The tracking list of modified controllers (models or forms)
         */
        function onModifiedStateChanged (ctrl, list) {

          var listIndex = list.indexOf(ctrl);
          var presentInList = (-1 !== listIndex);

          var updateRequired = true;

          if (ctrl.modified && !presentInList) {

            // Adding model to the internal list of modified models.
            list.push(ctrl);

          } else if (!ctrl.modified && presentInList) {

            // Removing model from the internal list of modified models.
            list.splice(listIndex, 1);

          } else {
            // Edge case when update is not required.
            updateRequired = false;
          }

          if (updateRequired) {

            updateModifiedState();

            // Notifying the parent form if it presents.
            if (parentFormCtrl && 'function' === typeof parentFormCtrl.$$notifyChildFormModifiedStateChanged) {
              parentFormCtrl.$$notifyChildFormModifiedStateChanged(formCtrl);
            }

            updateCssClasses();

          }

        }

        /**
         * Updates form modified state.
         *
         * Form is considered modified when it has at least one
         * modified element or child form.
         */
        function updateModifiedState () {

          formCtrl.modifiedCount = formCtrl.modifiedModels.length;
          formCtrl.modifiedChildFormsCount = formCtrl.modifiedChildForms.length;

          formCtrl.modified =
            (formCtrl.modifiedCount + formCtrl.modifiedChildFormsCount) > 0
          ;
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

})(window, angular);
