'use strict';

describe('Service: loggerLevels', function () {

  // load the service's module
  beforeEach(module('ui.logger'));

  // instantiate service
  var loggerLevels;
  beforeEach(inject(function (_loggerLevels_) {
    loggerLevels = _loggerLevels_;
  }));

  it('should do something', function () {
    expect(!!loggerLevels).toBe(true);
  });

});
