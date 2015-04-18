describe('Main Demo', function() {
  it('should have a title', function() {

    browser.get('/main/');

    expect(element(by.tagName('h1')).getText()).toEqual('Angular.js Input Modified Main Demo');

  });
});
