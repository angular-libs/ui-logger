'use strict';

describe('Service: srouceMap', function () {

  // load the service's module
  beforeEach(module('ui.logger'));

  // instantiate service
  var srouceMap;
  beforeEach(inject(function (_srouceMap_) {
    srouceMap = _srouceMap_;
  }));

  it('should do something', function () {
    expect(!!srouceMap).toBe(true);
  });

});
