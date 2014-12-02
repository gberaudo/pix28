describe('welcome page', function() {
  var formats = element(by.id('formats'));

  beforeEach(function() {
    //browser.get('http://thuy:thuy@cowaddict.org/~guiber/Testing/');
    browser.get('http://localhost:8080/');
  });

  it('should have a title', function() {
    expect(browser.getTitle()).toEqual('Create your own story');
  });

  it('should display the 15x15 and 21x21 formats', function() {
    formats.getText().then(function(text) {
      expect(text.indexOf('15x15') != -1);
      expect(text.indexOf('21x21') != -1);
    });
  });
});
