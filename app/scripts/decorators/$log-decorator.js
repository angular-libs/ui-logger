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
    $provide.decorator('$log', ['$delegate', 'logger','loggerLevels','loggerUtils', function ($delegate, logger,loggerLevels,loggerUtils) {

      var log={};
      logger._setLog($delegate);
      var defaultLogger=logger.getInstance('default');
      loggerLevels.forEach(function(level){
        log[level]=function () {
          if(loggerUtils.isEnabled(defaultLogger,level)) {
            defaultLogger[level].apply(defaultLogger, arguments);
          }
        };
      });
      return log;
    }]);
  });
