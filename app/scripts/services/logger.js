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

    this.setLevel=function(l) {
      level=l;
    };


    // Method for instantiating
    this.$get = function (stringUtils,loggerUtils) {
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
        loggerLevels.forEach(function(_level){
          logger[_level]=function(){
            if(loggerUtils.isEnabled(this,_level)){
              var args=Array.prototype.slice.call(arguments);
              args.unshift(this);
              loggerUtils.getLogData.apply(null, args).then(function(data){
                service.$log[_level](stringUtils.format(logPattern,data.time,data.name,(data.message+'\n'+data.stackframes)));
              });
            }
          };
        });
        return logger;
      }
      var service={
        _setLog:function($log){
          this.$log=$log;
        },
        getInstance:getInstance
      };
      return service;
    };
  });
