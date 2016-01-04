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
