(function (document, angular) {

  'use strict';

  angular.module('DemoApp', ['ngInputModified'])
    .controller('DefaultController', function ($scope) {
      $scope.user = {
        fullName: 'John Doe',
        about: '',
        gender: 'unknown'
      };
    })
  ;

})(document, angular);