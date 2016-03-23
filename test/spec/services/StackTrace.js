'use strict';

describe('Service: StackTrace', function () {

  // load the service's module
  beforeEach(module('ui.logger'));

  // instantiate service
  var _StackTrace;
  beforeEach(inject(function (StackTrace) {
    _StackTrace = StackTrace;
  }));

  xit('should do something', function () {
    expect(!!_StackTrace).toBe(true);
  });

});
