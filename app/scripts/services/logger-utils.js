'use strict';

/**
 * @ngdoc service
 * @name ui.logger.loggerUtils
 * @description
 * # loggerUtils
 * Service in the ui.logger.
 */
angular.module('ui.logger')
  .service('logUtils', function (StackTrace, $window,loggerLevels,$injector) {
    var $defaultLogger;
    function errback(err) {
      $defaultLogger.warn("Error server-side logging failed");
      $defaultLogger.log(err.message);
    }
    function log(logger,exception) {
      var errorMessage = exception.toString();
      var eventLogDateTime = moment().format('LLL');

      if(!(exception instanceof Error)){
        var $q=$injector.get('$q');
        return $q.resolve({
          name:logger.name,
          time:eventLogDateTime,
          url: $window.location.href,
          message: errorMessage
        });
      }else{
        return StackTrace.fromError(exception).then(function(stackframes){
          var stringifiedStack = stackframes.map(function(sf) {
            return sf.toString();
          }).join('\n');
          return {
            name:logger.name,
            time:eventLogDateTime,
            url: $window.location.href,
            message: errorMessage,
            stackframes: stringifiedStack//,
            //cause: ( cause || "")
          };
        }).catch(errback);
      }

    }
    function isEnabled(logger,type){
      if(logger.level){
        var loggerLevelIndex=loggerLevels.indexOf(logger.level);
        var loggerMethodIndex=loggerLevels.indexOf(type);
        if(loggerLevelIndex!==-1){
          if(loggerLevelIndex<=loggerMethodIndex){
            return true;
          }
        }
      }
      return false;
    }
    function set$defaultLogger(logger){
      if(logger){
        $defaultLogger=logger;
      }
      return $defaultLogger;
    }
    return {
      getLogData:log,
      $defaultLogger:set$defaultLogger,
      isEnabled:isEnabled
    };
  });
