'use strict';

/**
 * @ngdoc service
 * @name ui.logger.loggerUtils
 * @description
 * # loggerUtils
 * Service in the ui.logger.
 */
angular.module('ui.logger')
  .service('loggerUtils', function (StackTrace, $window,loggerLevels) {
    function errback(err) {
      console.warn("Error server-side logging failed");
      console.log(err.message);
    }
    function log(logger,exception, cause) {
      if(angular.isString(exception)){
        exception=new Error(exception);
      }
      var errorMessage = exception.toString();
      var eventLogDateTime = moment(new Date()).format('LLL');
      return StackTrace.fromError(exception).then(function(stackframes){
        var stringifiedStack = stackframes.map(function(sf) {
          return sf.toString();
        }).join('\n');
        return {
          name:logger.name,
          time:eventLogDateTime,
          url: $window.location.href,
          message: errorMessage,
          stackframes: stringifiedStack,
          cause: ( cause || "")
        };

      }).catch(errback);
    }
    return {
      getLogData:log,
      isEnabled:function(logger,type){
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
    };
  });
