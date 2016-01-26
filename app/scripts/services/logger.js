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
