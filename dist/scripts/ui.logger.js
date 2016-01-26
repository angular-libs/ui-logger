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


//angular.module('ui.logger').config(function(loggerProvider){
//  //loggerProvider.setLevel('debug');
//  loggerProvider.setInterceptor(function(data){
//    console.log(data);
//  });
//  //loggerProvider.disableConsoleLogging(true);
//});
//angular.module('ui.logger').run(function(logger){
//  var _logger=logger.getInstance();
//  var _logger1=logger.getInstance('run');
//  _logger.info(_logger===_logger1);
//  try{
//    throw new TypeError('error ...!!!');
//    //throw 'error ...!!!';
//  }catch(err){
//    _logger.debug(err);
//  }
//});

'use strict';

/**
 * @ngdoc function
 * @name ui.logger.decorator:Log
 * @description
 * # Log
 * Decorator of the ui.logger
 */
angular.module('ui.logger')
  .config(["$provide", function ($provide) {
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
  }]);

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
 * @name ui.logger.loggerUtils
 * @description
 * # loggerUtils
 * Service in the ui.logger.
 */
angular.module('ui.logger')
  .service('logUtils', ["StackTrace", "$window", "loggerLevels", "$injector", function (StackTrace, $window,loggerLevels,$injector) {
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
  }]);

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
(function(){
  function SetLevel(l) {
    this.level=l;
    return this;
  }
  function SetInterceptor(cb) {
    if(angular.isFunction(cb)){
      this.callback=cb;
    }
  }
  function DisableConsoleLogging(flag) {
    this._disableConsoleLogging=!!flag;
  }
  function SetDefaultName(name) {
    this._defaultName=name;
  }
  function format() {
    var str = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
      var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
      str = str.replace(regEx, arguments[i]);
    }
    return str;
  }
  function LoggerProvider(loggerLevels) {
    this.level=loggerLevels[0] ;
    this.callback=angular.noop;
    this._disableConsoleLogging=false;
    this._defaultName='default';
    var _defaultInstance;
    var _self=this;

    function factory (logUtils) {
      var logPattern='{0}::[{1}]> {2}';
      function getInstance(name){
        if(!name){
          if(_defaultInstance){
            return _defaultInstance;
          }
          name=_self._defaultName;
        }
        var logger={
          name:name,
          level:_self.level,
          setLevel:SetLevel
        };
        for(var k=0;k<loggerLevels.length;k++){
          _resigterLoggers(logger,loggerLevels[k]);
        }
        if(name===_self._defaultName){
          _defaultInstance=logger;
        }
        return logger;
      }
      function SetLog($log){
        this.$log=$log;
      }
      function _resigterLoggers(logger,_level){
        logger[_level]=function(){
          if(logUtils.isEnabled(this,_level)){
            var args=Array.prototype.slice.call(arguments);
            args.unshift(this);
            logUtils.getLogData.apply(null, args).then(function(data){
              if(!_self._disableConsoleLogging){
                service.$log[_level](format(logPattern,data.time,data.name,(data.message+'\n'+data.stackframes)));
              }
              _self.callback.call(null,data);
            });
          }
        };
      }
      var service={
        $setLog:SetLog,
        getInstance:getInstance
      };
      return service;
    }
    // Method for instantiating
    this.$get = ['logUtils',factory];
  }

  LoggerProvider.prototype.setLevel=SetLevel;
  LoggerProvider.prototype.setInterceptor=SetInterceptor;
  LoggerProvider.prototype.disableConsoleLogging=DisableConsoleLogging;
  LoggerProvider.prototype.setDefaultName=SetDefaultName;
  angular.module('ui.logger').provider('logger',['loggerLevels',LoggerProvider]);
})();
