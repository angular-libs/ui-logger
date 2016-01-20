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
