(function (document, angular) {

  'use strict';

  angular.module('DemoApp', ['ui.bootstrap', 'ngInputModified'])
    .controller('DefaultController', function ($scope) {
      $scope.task = {
        dateStart: new Date(Date.UTC(2015, 10, 6, 12, 0, 0, 0)),
        dateEnd: new Date(Date.UTC(2015, 10, 14, 17, 0, 0, 0))
      };
    })
  ;

})(document, angular);