'use strict';

describe('Service: soruceMap', function () {

  // load the service's module
  beforeEach(module('ui.logger'));

  // instantiate service
  var soruceMap;
  beforeEach(inject(function (_soruceMap_) {
    soruceMap = _soruceMap_;
  }));

  it('should do something', function () {
    expect(!!soruceMap).toBe(true);
  });

});
