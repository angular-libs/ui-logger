'use strict';

/**
 * @ngdoc service
 * @name ui.logger.logging
 * @description
 * # logging
 * Service in the ui.logger.
 */
angular.module('ui.logger')
  .factory('logging', function (stringUtils,loggerUtils,loggerLevels) {
    var logMessage='{0}::[{1}]> {2}';
    var logger={
      enabled: false
    };
    loggerLevels.forEach(function(level){
      logger[level]=function(){
        loggerUtils.getLogData.apply(null, arguments).then(function(data){
          console[level](stringUtils.format(logMessage,data.time,data.name,(data.message+'\n'+data.stackframes)));
        });

      };
    });
    return logger;
  });
