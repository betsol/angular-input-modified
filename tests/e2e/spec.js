describe('Input Modified', function() {

  describe('Main Demo', function() {

    beforeEach(function () {
      browser.get('/main/');
    });

    it('should have a proper title', function() {
      expect(element(by.tagName('h1')).getText()).toEqual('Angular.js Input Modified Main Demo');
    });

  });

});
