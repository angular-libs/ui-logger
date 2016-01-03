'use strict';

/**
 * @ngdoc overview
 * @name ui.logger
 * @description
 * # ui.logger
 *
 * Main module of the application.
 */
angular
  .module('ui.logger', []);


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
      throw {
        message: 'error message'
      };
    };

    $scope.throwNestedException = function() {
      functionThrowsNestedExceptions();
    };

    functionThatThrows = function() {
      var x = y;
    };

    functionThrowsNestedExceptions = function() {
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

'use strict';

/**
 * @ngdoc function
 * @name ui.logger.decorator:Log
 * @description
 * # Log
 * Decorator of the ui.logger
 */
angular.module('ui.logger')
  .config(function ($provide) {
    $provide.decorator('$log', ['$delegate', 'logging', function ($delegate, logging) {
      logging.enabled = true;
      var methods = {
        error: function () {
          if (logging.enabled) {
            $delegate.error.apply($delegate, arguments);
            logging.error.apply(null, arguments);
          }
        },
        log: function () {
          if (logging.enabled) {
            $delegate.log.apply($delegate, arguments);
            logging.log.apply(null, arguments);
          }
        },
        info: function () {
          if (logging.enabled) {
            $delegate.info.apply($delegate, arguments);
            logging.info.apply(null, arguments);
          }
        },
        warn: function () {
          if (logging.enabled) {
            $delegate.warn.apply($delegate, arguments);
            logging.warn.apply(null, arguments);
          }
        }
      };
      return methods;
    }]);
  });

'use strict';

/**
 * @ngdoc service
 * @name ui.logger.logging
 * @description
 * # logging
 * Service in the ui.logger.
 */
angular.module('ui.logger')
  .service('logging', function ($injector) {

    var service = {
      error: function () {
        self.type = 'error';
        log.apply(self, arguments);
      },
      warn: function () {
        self.type = 'warn';
        log.apply(self, arguments);
      },
      info: function () {
        self.type = 'info';
        log.apply(self, arguments);
      },
      log: function () {
        self.type = 'log';
        log.apply(self, arguments);
      },
      enabled: false,
      logs: []
    };

    var log = function () {

      var args = [];
      if (typeof arguments === 'object') {
        for (var i = 0; i < arguments.length; i++) {
          var arg = arguments[i];
          var exception = {};
          exception.message = arg.message;
          exception.stack = arg.stack;
          args.push(JSON.stringify(exception));
        }
      }

      var eventLogDateTime = moment(new Date()).format('LLL');
      var logItem = {
        time: eventLogDateTime,
        message: args.join('\n'),
        type: type
      };
      console.log('Custom logger [' + logItem.time + '] ' + logItem.message.toString());
      service.logs.push(logItem);
    };


    return service;

  });
