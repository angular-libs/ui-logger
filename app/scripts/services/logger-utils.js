'use strict';

/**
 * @ngdoc service
 * @name ui.logger.loggerUtils
 * @description
 * # loggerUtils
 * Service in the ui.logger.
 */
angular.module('ui.logger')
  .service('loggerUtils', function (StackTrace, $window) {
    function errback(err) {
      console.warn("Error server-side logging failed");
      console.log(err.message);
    }
    function log(exception, cause) {
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
          name:'a-logger',
          time:eventLogDateTime,
          url: $window.location.href,
          message: errorMessage,
          stackframes: stringifiedStack,
          cause: ( cause || "")
        };

      }).catch(errback);
    }
    return {
      getLogData:log
    }
  });
