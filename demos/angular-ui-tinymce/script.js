(function (document, angular) {

  'use strict';

  angular.module('DemoApp', ['ui.tinymce', 'ngInputModified'])
    .controller('DefaultController', function ($scope) {
      $scope.article = {
        content:
            '<h1>Lorem ipsum</h1>'
          + '<p>Lorem ipsum dolor sit amet</p>'
          + '<p>Consectetur adipisicing elit.</p>'
      };
    })
  ;

})(document, angular);
