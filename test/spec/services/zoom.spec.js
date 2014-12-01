describe('app.ImgService', function() {
  var imgService;
  var canvas = {width: 800, height: 600};
  var image = {mWidth: 800, mHeight: 600};

  beforeEach(function() {
    inject(function($injector) {
      imgService = $injector.get('ImgService');
    });
  });

  describe('#zoom out from a maximised fitting display', function() {
    var display = {sx: 0, sy:0, sw: 800, sh: 600};
    var rate = 2;
    it('stayed the same', function() {
      imgService.computeZoomedDisplay(canvas, image, display, rate);
      expect(display.sw).toBe(800);
      expect(display.sx).toBe(0);
      expect(display.sy).toBe(0);
      expect(display.sh).toBe(600);
    });
  });

  describe('#zoom in from a maximised fitting display', function() {
    var display = {sx: 0, sy:0, sw: 800, sh: 600};
    var rate = 1/2;
    it('zoomed the display centered', function() {
      imgService.computeZoomedDisplay(canvas, image, display, rate);
      expect(display.sw).toBe(400);
      expect(display.sx).toBe(200);
      expect(display.sy).toBe(150);
      expect(display.sh).toBe(300);
    });
  });
});
