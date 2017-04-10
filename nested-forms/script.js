(function (document, angular) {

  'use strict';

  angular.module('DemoApp', ['ngInputModified'])
    .controller('DefaultController', function ($scope) {
      $scope.user = {
        fullName: 'John Doe',
        about: '',
        gender: 'unknown'
      };
      $scope.showThirdForm = true;
      $scope.toggleThirdForm = function () {
          $scope.showThirdForm = !$scope.showThirdForm;
      }
    })
  ;

})(document, angular);
