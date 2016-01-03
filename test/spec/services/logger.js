'use strict';

describe('Service: logger', function () {

  // instantiate service
  var logger,
    init = function () {
      inject(function (_logger_) {
        logger = _logger_;
      });
    };

  // load the service's module
  beforeEach(module('ui.logger'));

  it('should do something', function () {
    init();

    expect(!!logger).toBe(true);
  });

  it('should be configurable', function () {
    module(function (loggerProvider) {
      loggerProvider.setSalutation('Lorem ipsum');
    });

    init();

    expect(logger.greet()).toEqual('Lorem ipsum');
  });

});
