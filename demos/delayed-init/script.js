(function (document, angular) {

  'use strict';

  angular.module('DemoApp', ['ngInputModified'])
    .controller('DefaultController', function ($scope, $timeout) {

      $scope.loading = false;
      $scope.loadFormData = loadFormData;

      $scope.user = {
        fullName: '',
        email: ''
      };

      function loadFormData () {
        $scope.loading = true;
        $timeout(function dataLoaded() {
          $scope.loading = false;
          $scope.user = {
            fullName: 'John Doe'
          };
          // Calling set-pristine after digest cycle.
          $timeout(function () {
            $scope.myForm.$setPristine();
          });
        }, 1500);
      }

    })
  ;

})(document, angular);