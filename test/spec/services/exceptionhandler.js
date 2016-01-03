'use strict';

describe('Service: exceptionHandler', function () {

  // instantiate service
  var exceptionHandler,
    init = function () {
      inject(function (_exceptionHandler_) {
        exceptionHandler = _exceptionHandler_;
      });
    };

  // load the service's module
  beforeEach(module('ui.logger'));

  it('should do something', function () {
    init();

    expect(!!exceptionHandler).toBe(true);
  });

  it('should be configurable', function () {
    module(function (exceptionHandlerProvider) {
      exceptionHandlerProvider.setSalutation('Lorem ipsum');
    });

    init();

    expect(exceptionHandler.greet()).toEqual('Lorem ipsum');
  });

});
