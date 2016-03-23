'use strict';

describe('Service: sourceMapUtil', function () {

  // load the service's module
  beforeEach(module('ui.logger'));

  // instantiate service
  var sourceMapUtil;
  beforeEach(inject(function (_sourceMapUtil_) {
    sourceMapUtil = _sourceMapUtil_;
  }));

  xit('should do something', function () {
    expect(!!sourceMapUtil).toBe(true);
  });

});
