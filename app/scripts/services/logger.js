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
