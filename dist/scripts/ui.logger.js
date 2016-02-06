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


angular.module('ui.logger').config(["loggerProvider", function(loggerProvider){
  loggerProvider.setLevel('debug');
  loggerProvider.setInterceptor(function(data){
    console.log(data);
  });
  loggerProvider.disableConsoleLogging(true);
  //StackTraceProvider.setOptions({offline:true});
}]);
angular.module('ui.logger').run(["logger", function testRun(logger){
  var _logger=logger.getInstance();
  var _logger1=logger.getInstance('run');
  _logger.info(_logger===_logger1);
  try{
    throw new TypeError('error ...!!!');
    //throw 'error ...!!!';
  }catch(err){
    _logger.debug(err);
  }
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
(function(){

  function Provider(){
    var self=this;
    function Service(){
      window.StackTrace.$options=self.options;
      return window.StackTrace;
    }
    this.options={
      offline:true
    };
    this.$get=Service;
  }
  function SetOptions(opts){
    angular.extend(this.options,opts);
  }
  Provider.prototype.setOptions=SetOptions;
  angular.module('ui.logger').provider('StackTrace',[Provider]);
})();


'use strict';

/**
 * @ngdoc service
 * @name ui.logger.loggerUtils
 * @description
 * # loggerUtils
 * Service in the ui.logger.
 */
angular.module('ui.logger')
  .service('logUtils', ["StackTrace", "$window", "loggerLevels", "$injector", "sourceMapUtil", function (StackTrace, $window,loggerLevels,$injector,sourceMapUtil) {
    var $defaultLogger;
    function errback(err) {
      $defaultLogger.warn("Error server-side logging failed");
      $defaultLogger.log(err.message);
    }
    function log(logger,exception) {
      var errorMessage = exception.toString();
      var eventLogDateTime = moment().format('LLL');
      var $q;
      if(!(exception instanceof Error)){
        $q=$injector.get('$q');
        return $q.resolve({
          name:logger.name,
          time:eventLogDateTime,
          url: $window.location.href,
          message: errorMessage
        });
      }else{
        $q=$injector.get('$q');

        return StackTrace.fromError(exception,StackTrace.$options).then(function(stackframes){
          var _promises=[];
          for(var a=0;a<stackframes.length;a++){
            _promises.push(sourceMapUtil.getOriginalLocation(stackframes[a]));
          }
          return $q.all(_promises).then(function(results){
            var stringifiedStack = results.map(function(sf) {
              return sf.toString();
            });//.join('\n');
            return {
              name:logger.name,
              time:eventLogDateTime,
              url: $window.location.href,
              message: errorMessage,
              stackframes: stringifiedStack
            };
          });

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

'use strict';

/**
 * @ngdoc service
 * @name ui.logger.sourceMap
 * @description
 * # sourceMap
 * Constant in the ui.logger.
 */
angular.module('ui.logger').constant('sourceMap', window.sourceMap);

'use strict';

/**
 * @ngdoc service
 * @name ui.logger.sourceMapUtil
 * @description
 * # sourceMapUtil
 * Factory in the ui.logger.
 */
(function(){
  function _findSourceMappingURL(source) {
    var m = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/.exec(source);
    if (m && m[1]) {
      return m[1];
    }
  }
  function Configure(options) {
    angular.extend(this.options,options);
  }
  function validURL(str) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(str);
  }
  //function format() {
  //  var str = arguments[0];
  //  for (var i = 1; i < arguments.length; i++) {
  //    var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
  //    str = str.replace(regEx, arguments[i]);
  //  }
  //  return str;
  //}
  function _findFunctionName(source, lineNumber) {
    // function {name}({args}) m[1]=name m[2]=args
    var reFunctionDeclaration = /function\s+([^(]*?)\s*\(([^)]*)\)/;
    // {name} = function ({args}) TODO args capture
    var reFunctionExpression = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*function\b/;
    // {name} = eval()
    var reFunctionEvaluation = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*(?:eval|new Function)\b/;
    var lines = source.split('\n');

    // Walk backwards in the source lines until we find the line which matches one of the patterns above
    var code = '', line, maxLines = Math.min(lineNumber, 20), m, commentPos;
    for (var i = 0; i < maxLines; ++i) {
      // lineNo is 1-based, source[] is 0-based
      line = lines[lineNumber - i - 1];
      if(line){
        commentPos = line.indexOf('//');
        if (commentPos >= 0) {
          line = line.substr(0, commentPos);
        }
      }


      if (line) {
        code = line + code;
        m = reFunctionExpression.exec(code);
        if (m && m[1]) {
          return m[1];
        }
        m = reFunctionDeclaration.exec(code);
        if (m && m[1]) {
          return m[1];
        }
        m = reFunctionEvaluation.exec(code);
        if (m && m[1]) {
          return m[1];
        }
      }
    }
    return undefined;
  }
  function Provider(sourceMap) {
    this.options={
      offline:true
    };
    var _self=this;
    function factory($injector) {
      var _cache={};
      function Service(){
        function getSourceFileUrl(url){
          var $q=$injector.get('$q');
          var def=$q.defer();
          $.ajax(url).then(function(content) {
            //_cache[url]._file=content;
            def.resolve(_findSourceMappingURL(content));
          }).fail(function(error) {
            def.reject(error);
          });
          return def.promise;
        }
        function getOriginalLocation(stack){
          var $q=$injector.get('$q');
          var url=stack.fileName;
          var def=$q.defer();
          if(!_self.options.offline){
            def.resolve(stack);
            return;
          }
          //check if map exist in cache for the file else get the map and update the cache
          if(!_cache[url]){
            _cache[url]={
              exist:false,
              _map:{},
              _file:''
            };
            getSourceFileUrl(url).then(function(mapUrl){
              if(mapUrl && !validURL(mapUrl)){
                mapUrl=url.substring(0,url.lastIndexOf('/')+1)+mapUrl;
              }
              $.getJSON(mapUrl, function(map) {
                _cache[url].exist=true;
                _cache[url]._map=new sourceMap.SourceMapConsumer(map);
                var loc=_cache[url]._map.originalPositionFor({
                  line: stack.lineNumber,
                  column: stack.columnNumber
                });
                if(_cache[url]._file){
                  loc.name=_findFunctionName(_cache[url]._file,loc.line, loc.column);
                  _stack=new window.StackFrame(loc.name, stack.args, loc.source, loc.line, loc.column);
                  def.resolve(_stack);
                }else{
                  var sourceFileUlr=url.substring(0,url.lastIndexOf('/')+1)+loc.source;
                  $.ajax(sourceFileUlr).then(function(content) {
                    _cache[url]._file=content;
                    loc.name=_findFunctionName(_cache[url]._file,loc.line, loc.column);
                    _stack=new window.StackFrame(loc.name, stack.args, loc.source, loc.line, loc.column);
                    def.resolve(_stack);
                  }).fail(function() {
                    _cache[url]._file=null;
                    def.resolve(stack);
                  });
                }


              }).fail(function() {
                _cache[url].exist=false;
                _cache[url]._map=null;
                def.resolve(stack);
              });
            },function(){
              _cache[url].exist=false;
              _cache[url]._map=null;
              def.resolve(stack);
            });

          }else{
            if(_cache[url].exist){
              //read map and return stack from source
              var _stack=_cache[url]._map.originalPositionFor(stack);
              def.resolve(_stack);
            }else{
              def.resolve(stack);
            }
          }
          return def.promise;
        }
        return {
          getOriginalLocation: getOriginalLocation
        };
      }
      return new Service();
    }
    // Method for instantiating
    this.$get = ['$injector',factory];
  }

  Provider.prototype.configure=Configure;
  angular.module('ui.logger').provider('sourceMapUtil',['sourceMap',Provider]);
})();
//angular.module('ui.logger').factory('sourceMapUtil', function (sourceMap,$injector) {
//    var _cache={};
//    function Service(){
//
//      function getOriginalLocation(stack){
//        var $q=$injector.get('$q');
//        var url=stack.fileName;
//        var def=$q.defer();
//        //check if map exist in cache for the file else get the map and update the cache
//        if(!_cache[url]){
//          url=url+'.map';
//          _cache[url]={
//            exist:false,
//            _map:{}
//          };
//          $.getJSON(url, function(map) {
//            _cache[url].exist=true;
//            _cache[url]._map=new sourceMap.SourceMapConsumer(map);
//            var _stack=_cache[url]._map.originalPositionFor(stack);
//            def.resolve(_stack);
//          }).fail(function(error) {
//            _cache[url].exist=false;
//            _cache[url]._map=null;
//            def.resolve(stack);
//          });
//        }else{
//          if(_cache[url].exist){
//            //read map and return stack from source
//            var _stack=_cache[url]._map.originalPositionFor(stack);
//            def.resolve(_stack);
//          }else{
//            def.resolve(stack);
//          }
//        }
//        return def.promise;
//      }
//      return {
//        getOriginalLocation: getOriginalLocation
//      };
//    }
//    return new Service();
//  });
