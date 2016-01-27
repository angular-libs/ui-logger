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
    this.options={};
    this.$get=Service;
  }
  function SetOptions(opts){
    angular.extend(this.options,opts);
  }
  Provider.prototype.setOptions=SetOptions;
  angular.module('ui.logger').provider('StackTrace',[Provider]);
})();

