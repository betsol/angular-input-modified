'use strict';

describe('Angular.js Input Modified Config', function () {

  var configProvider;

  beforeEach(function () {
    var fakeModule = angular.module('fake', function () {});
    fakeModule.config(function (inputModifiedConfigProvider) {
      configProvider = inputModifiedConfigProvider;
    });
    module('ngInputModified', 'fake');

    // Kickstart the injectors previously registered
    // with calls to angular.mock.module
    inject(function () {});
  });

  it('enableGlobally is worked as expected', function () {
    configProvider.enableGlobally();
    expect(configProvider.$get().enabledGlobally).to.be(true);
  });

  it('disableGlobally is worked as expected', function () {
    configProvider.disableGlobally();
    expect(configProvider.$get().enabledGlobally).to.be(false);
  });

});
