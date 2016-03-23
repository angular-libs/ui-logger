'use strict';

describe('Service: stringUtils', function () {

  // load the service's module
  beforeEach(module('ui.logger'));

  // instantiate service
  var stringUtils;
  beforeEach(inject(function (_stringUtils_) {
    stringUtils = _stringUtils_;
  }));

  xit('should do something', function () {
    expect(!!stringUtils).toBe(true);
  });

});
