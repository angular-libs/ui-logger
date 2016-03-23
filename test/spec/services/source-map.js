'use strict';

describe('Service: sourceMap', function () {

  // load the service's module
  beforeEach(module('ui.logger'));

  // instantiate service
  var sourceMap;
  beforeEach(inject(function (_sourceMap_) {
    sourceMap = _sourceMap_;
  }));

  xit('should do something', function () {
    expect(!!sourceMap).toBe(true);
  });

});
