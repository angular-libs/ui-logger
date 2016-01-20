'use strict';

/**
 * @ngdoc overview
 * @name ui.logger
 * @description
 * # ui.logger
 *
 * Main module of the application.
 */
angular.module('ui.logger', []);
/*angular.module('ui.logger').config(function(loggerProvider){
  loggerProvider.setLevel('debug');
  loggerProvider.setInterceptor(function(data){
    console.log(data);
  });
});
angular.module('ui.logger').run(function(logger){
  var _logger=logger.getInstance('runlogger');
  try{
    //throw new Error('error ...!!!');
    throw 'error ...!!!';
  }catch(err){
    _logger.debug(err);
  }
});*/

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
      logger.$setLog($delegate);
      loggerUtils.$defaultLogger($delegate);
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

'use strict';

/**
 * @ngdoc service
 * @name ui.logger.StackTrace
 * @description
 * # StackTrace
 * Service in the ui.logger.
 */
angular.module('ui.logger').service('StackTrace', function () {
    return window.StackTrace;
  });

'use strict';

/**
 * @ngdoc service
 * @name ui.logger.stringUtils
 * @description
 * # stringUtils
 * Service in the ui.logger.
 */
angular.module('ui.logger')
  .service('stringUtils', function () {
    return {
      format:function() {
        var str = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
          var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
          str = str.replace(regEx, arguments[i]);
        }
        return str;
      }
    };
  });

'use strict';

/**
 * @ngdoc service
 * @name ui.logger.loggerUtils
 * @description
 * # loggerUtils
 * Service in the ui.logger.
 */
angular.module('ui.logger')
  .service('loggerUtils', function (StackTrace, $window,loggerLevels,$injector) {
    var $defaultLogger;
    function errback(err) {
      $defaultLogger.warn("Error server-side logging failed");
      $defaultLogger.log(err.message);
    }
    function log(logger,exception, cause) {
      var errorMessage = exception.toString();
      var eventLogDateTime = moment().format('LLL');

      if(angular.isString(exception)){
        var $q=$injector.get('$q');
        return $q.resolve({
          name:logger.name,
          time:eventLogDateTime,
          url: $window.location.href,
          message: errorMessage,
          stackframes: [],
          cause: ( cause || "")
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
            stackframes: stringifiedStack,
            cause: ( cause || "")
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

'use strict';

/**
 * @ngdoc service
 * @name ui.logger.loggerLevels
 * @description
 * # loggerLevels
 * Constant in the ui.logger.
 */
angular.module('ui.logger')
  .constant('loggerLevels', ['debug','info','warn','log','error']);

'use strict';

/**
 * @ngdoc service
 * @name ui.logger.logger
 * @description
 * # logger
 * Provider in the ui.logger.
 */
angular.module('ui.logger')
  .provider('logger', function (loggerLevels) {

    var level=loggerLevels[0] ;
    var callback=angular.noop;
    function setLevel(l) {
      level=l;
    }
    function setInterceptor(cb) {
      if(angular.isFunction(cb)){
        callback=cb;
      }
    }
    this.setLevel=setLevel;
    this.setInterceptor=setInterceptor;

    function factory (stringUtils,loggerUtils) {
      var logPattern='{0}::[{1}]> {2}';
      function getInstance(name){
        if(!name){
          new Error('name is required!!');
        }
        var logger={
          name:name,
          enabled: false,
          level:level,
          setLevel:function(l){
            this.level=l;
            return this;
          }
        };
        function resigterLoggers(_level){
          logger[_level]=function(){
            if(loggerUtils.isEnabled(this,_level)){
              var args=Array.prototype.slice.call(arguments);
              args.unshift(this);
              loggerUtils.getLogData.apply(null, args).then(function(data){
                service.$log[_level](stringUtils.format(logPattern,data.time,data.name,(data.message+'\n'+data.stackframes)));
                callback.call(null,data);
              });
            }
          };
        }
        loggerLevels.forEach(resigterLoggers);
        return logger;
      }
      function SetLog($log){
        this.$log=$log;
      }
      var service={
        $setLog:SetLog,
        getInstance:getInstance
      };
      return service;
    }
    // Method for instantiating
    this.$get = ['stringUtils','loggerUtils',factory];
  });
