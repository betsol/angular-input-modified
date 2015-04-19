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
