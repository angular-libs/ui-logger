'use strict';

describe('Service: exceptionLoggingService', function () {

  // load the service's module
  beforeEach(module('ui.logger'));

  // instantiate service
  var exceptionLoggingService;
  beforeEach(inject(function (_exceptionLoggingService_) {
    exceptionLoggingService = _exceptionLoggingService_;
  }));

  it('should do something', function () {
    expect(!!exceptionLoggingService).toBe(true);
  });

});
