'use strict';

describe('Service: loggerUtils', function () {

  // load the service's module
  beforeEach(module('ui.logger'));

  // instantiate service
  var loggerUtils;
  beforeEach(inject(function (_loggerUtils_) {
    loggerUtils = _loggerUtils_;
  }));

  xit('should do something', function () {
    expect(!!loggerUtils).toBe(true);
  });

});
