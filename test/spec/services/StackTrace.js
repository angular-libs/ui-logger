'use strict';

describe('Service: traceService', function () {

  // load the service's module
  beforeEach(module('ui.logger'));

  // instantiate service
  var _StackTrace;
  beforeEach(inject(function (StackTrace) {
    _StackTrace = StackTrace;
  }));

  it('should do something', function () {
    expect(!!traceService).toBe(true);
  });

});
