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
    $provide.decorator('$log', ['$delegate', 'logger','loggerLevels','logUtils', function ($delegate, logger,loggerLevels,logUtils) {

      var log={};
      logger.$setLog($delegate);
      logUtils.$defaultLogger($delegate);
      var defaultLogger=logger.getInstance();
      loggerLevels.forEach(function(level){
        log[level]=function () {
          if(logUtils.isEnabled(defaultLogger,level)) {
            defaultLogger[level].apply(defaultLogger, arguments);
          }
        };
      });
      return log;
    }]);
  });
