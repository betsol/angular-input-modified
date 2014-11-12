(function(document, angular) {

    'use strict';

    angular.module('DemoApp', ['ui.bootstrap', 'DatepickerWorkaround', 'ngInputModified'])
        .config(function(inputModifiedConfigProvider) {
            inputModifiedConfigProvider
                .disableGlobally()
            ;
        })
        .controller('DefaultController', function($scope) {
            $scope.task = {
                dateStart: new Date(Date.UTC(2014, 10, 10, 0, 0, 0, 0)),
                dateEnd: new Date(Date.UTC(2014, 10, 16, 0, 0, 0, 0))
            };
        })
    ;

    /**
     * This is a workaround for Angular UI DatePicker bug #2659:
     * See: https://github.com/angular-ui/bootstrap/issues/2659
     */
    angular
        .module('DatepickerWorkaround', [])
        .directive('datepickerPopup', function () {
            return {
                restrict: 'EAC',
                require: 'ngModel',
                link: function (scope, element, attr, controller) {
                    // Remove the default formatter from the input directive to prevent conflict.
                    controller.$formatters.shift();
                }
            }
        })
    ;

})(document, angular);