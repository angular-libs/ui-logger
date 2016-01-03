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
    $provide.decorator('$log', ['$delegate', 'logging','loggerLevels', function ($delegate, logging,loggerLevels) {
      logging.enabled = true;
      var log={};

      loggerLevels.forEach(function(level){
        log[level]=function () {
          if (logging.enabled) {
            //$delegate[level].apply($delegate, arguments);
            logging[level].apply(null, arguments);
          }
        }
      });
      return log;
    }]);
  });
