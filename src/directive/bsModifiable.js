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
