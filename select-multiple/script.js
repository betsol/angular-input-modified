(function(document, angular) {

    'use strict';

    angular.module('DemoApp', ['ngInputModified'])
        .controller('DefaultController', function($scope) {

            var banana   = { id: 1, title: 'Banana'   };
            var mango    = { id: 2, title: 'Mango'    };
            var maracuya = { id: 3, title: 'Maracuya' };
            var oranges  = { id: 4, title: 'Oranges'  };

            $scope.user = {
                favoriteFruit: [banana, maracuya]
            };

            $scope.fruits = [banana, mango, maracuya, oranges];
        })
    ;

})(document, angular);