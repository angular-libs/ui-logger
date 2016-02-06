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
    // {name} = function ({args})
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
