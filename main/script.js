(function(document, angular) {

    'use strict';

    angular.module('DemoApp', ['ngInputModified'])
        .controller('DefaultController', function($scope) {
            $scope.user = {
                fullName: 'John Doe',
                about: '',
                gender: 'unknown',
                favoriteFruit: null
            };

            $scope.fruits = [{
                id: 1,
                title: 'Banana'
            }, {
                id: 2,
                title: 'Mango'
            }, {
                id: 3,
                title: 'Maracuya'
            }];

        })
    ;

})(document, angular);