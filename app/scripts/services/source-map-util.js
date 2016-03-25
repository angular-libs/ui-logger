'use strict';

/**
 * @ngdoc service
 * @name ui.logger.sourceMapUtil
 * @description
 * # sourceMapUtil
 * Factory in the ui.logger.
 */
(function(){
  function findNode(nodeList,lineNumber,ColumnNumber){
    var first = 0;
    var last = nodeList.length - 1;
    var nodeIndex;
    var middle = Math.floor((first+last)/2);
    while(first<=last){
      if(nodeList[middle].loc.start.line>lineNumber){
        last = middle -1;
      }
      else if((nodeList[middle].loc.start.line<=lineNumber) && (nodeList[middle].loc.end.line >=lineNumber) ){
        if(nodeList[middle].loc.start.line===lineNumber && nodeList[middle].loc.start.column >ColumnNumber ){
          last = middle -1;
        }else if(nodeList[middle].loc.end.line===lineNumber && nodeList[middle].loc.end.column < ColumnNumber){
          first = middle+1;
        }else{
        nodeIndex = middle;
        break;}
      }
      else {
        first = middle+1;
      }
      middle = Math.floor((first+last)/2);
    }
    if(first > last){
      return {};
    }
    else{

      return nodeList[nodeIndex];
    }
  }

  function switchNodeType(node,lineNumber,ColumnNumber){
    var type = node.type;
    var result={};
    switch(type) {
      case 'ExpressionStatement':
        result = switchNodeType(node.expression,lineNumber,ColumnNumber);
        break;
      case 'CallExpression':
        var argumentNode = findNode(node.arguments,lineNumber,ColumnNumber);
        if (!Object.keys(argumentNode).length) {
          result = switchNodeType(node.callee, lineNumber,ColumnNumber);
        }
        else {
          result = switchNodeType(argumentNode, lineNumber,ColumnNumber);
        }

        break;
      case 'FunctionDeclaration':
      case 'FunctionExpression':
        var funcNode = findNode(node.body.body, lineNumber,ColumnNumber);
        result = switchNodeType(funcNode, lineNumber,ColumnNumber);
        if(result.id===undefined){
          result=node;
        }
        break;
      case 'ArrayExpression':
        var arrNode=findNode(node.elements, lineNumber,ColumnNumber);
        result = switchNodeType(arrNode, lineNumber,ColumnNumber);
        break;
      case 'VariableDeclaration':
        var declarationNode=findNode(node.declarations, lineNumber,ColumnNumber);
        var testNode=switchNodeType(declarationNode.init, lineNumber,ColumnNumber);
        if(testNode.type==='FunctionDeclaration'||testNode.type==='FunctionExpression'){
         result=declarationNode;
        }else{
            result = node;
        }
        break;
      case 'AssignmentExpression':
        result =switchNodeType(node.right, lineNumber,ColumnNumber);
        break;
      default :
        result = node;
    }
    return result;
  }

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
  function _findFunctionName(syntaxTree,lineNumber,ColumnNumber) {
    var node= findNode(syntaxTree.body,lineNumber,ColumnNumber);
    var finalResult = switchNodeType(node,lineNumber,ColumnNumber);
    if(finalResult.id===null){
      return undefined;
    }
    else{
      return finalResult.id.name;
    }
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
          var _stack;
          var def=$q.defer();

          if(!_self.options.offline){
            def.resolve(stack);
            return;
          }
          //check if map exist in cache for the file else get the map and update the cache
          if(!_cache[url]){
            var def1= $q.defer();
            _cache[url]={
              exist:def1.promise,
              _map:{},
              _file:'',
              _syntaxTree:''
            };
            getSourceFileUrl(url).then(function(mapUrl){
              if(mapUrl && !validURL(mapUrl)){
                mapUrl=url.substring(0,url.lastIndexOf('/')+1)+mapUrl;
              }
              $.getJSON(mapUrl, function(map) {
                _cache[url]._map=new sourceMap.SourceMapConsumer(map);
                var loc=_cache[url]._map.originalPositionFor({
                  line: stack.lineNumber,
                  column: stack.columnNumber
                });
                if(_cache[url]._file){
                  _cache[url]._syntaxTree = window.esprima.parse(_cache[url]._file,{loc:true});
                  loc.name=_findFunctionName( _cache[url]._syntaxTree,loc.line, loc.column);
                  _stack=new window.StackFrame(loc.name, stack.args, loc.source, loc.line, loc.column);
                  def.resolve(_stack);
                }else{
                  var sourceFileUlr=url.substring(0,url.lastIndexOf('/')+1)+loc.source;
                  $.ajax(sourceFileUlr).then(function(content) {
                    _cache[url]._file=content;
                    def1.resolve(true);
                    _cache[url]._syntaxTree = window.esprima.parse(_cache[url]._file,{loc:true});
                    loc.name=_findFunctionName( _cache[url]._syntaxTree,loc.line, loc.column);
                    _stack=new window.StackFrame(loc.name, stack.args, loc.source, loc.line, loc.column);
                    def.resolve(_stack);
                  }).fail(function() {
                    _cache[url]._file=null;
                    def1.resolve(true);
                    def.resolve(stack);
                  });
                }


              }).fail(function() {
                def1.reject();
                _cache[url]._map=null;
                def.resolve(stack);
              });
            },function(){
              def1.reject();
              _cache[url]._map=null;
              def.resolve(stack);
            });

          }else{
            _cache[url].exist.then(function(val){
              if(val){
                //read map and return stack from source
                var loc=_cache[url]._map.originalPositionFor({
                  line: stack.lineNumber,
                  column: stack.columnNumber
                });
                loc.name=_findFunctionName( _cache[url]._syntaxTree,loc.line, loc.column);
                _stack=new window.StackFrame(loc.name, stack.args, loc.source, loc.line, loc.column);
                def.resolve(_stack);
              }
            },function(){
              def.resolve(stack);
            });


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
