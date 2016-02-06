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


angular.module('ui.logger').config(function(loggerProvider){
  loggerProvider.setLevel('debug');
  loggerProvider.setInterceptor(function(data){
    console.log(data);
  });
  loggerProvider.disableConsoleLogging(true);
  //StackTraceProvider.setOptions({offline:true});
});
angular.module('ui.logger').run(function testRun(logger){
  var _logger=logger.getInstance();
  var _logger1=logger.getInstance('run');
  _logger.info(_logger===_logger1);
  try{
    throw new TypeError('error ...!!!');
    //throw 'error ...!!!';
  }catch(err){
    _logger.debug(err);
  }
});

