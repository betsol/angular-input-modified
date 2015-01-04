(function(document, angular) {

    'use strict';

    angular.module('DemoApp', ['ngInputModified'])
        .controller('DefaultController', function($scope) {
            $scope.fruits = [{
                id: 'banana',
                title: 'Banana',
                selected: false
            }, {
                id: 'mango',
                title: 'Mango',
                selected: true
            }, {
                id: 'maracuya',
                title: 'Maracuya',
                selected: false
            }, {
                id: 'oranges',
                title: 'Oranges',
                selected: false
            }];
        })
    ;

})(document, angular);