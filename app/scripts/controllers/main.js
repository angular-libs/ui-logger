'use strict';

/**
 * @ngdoc function
 * @name ui.logger.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ui.logger
 */
angular.module('ui.logger')
  .controller('MainCtrl', ['$scope', '$log', function($scope, $log) {
    $scope.$log = $log;
    $scope.throwError = function() {
      functionThatThrows();
    };

    $scope.throwException = function() {
      throw 'error message';
    };

    $scope.throwNestedException = function() {
      functionThrowsNestedExceptions();
    };

    function functionThatThrows() {
      var x = y;
    };

    function functionThrowsNestedExceptions() {
      try {
        var a = b;
      } catch (e) {
        try {
          var c = d;
        } catch (ex) {
          $log.error(e, ex);
        }
      }
    };
  }]);
