'use strict';

describe('Service: loggerMethods', function () {

  // load the service's module
  beforeEach(module('ui.logger'));

  // instantiate service
  var loggerMethods;
  beforeEach(inject(function (_loggerMethods_) {
    loggerMethods = _loggerMethods_;
  }));

  it('should do something', function () {
    expect(!!loggerMethods).toBe(true);
  });

});
