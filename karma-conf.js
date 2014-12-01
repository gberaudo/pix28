module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'test/IndexedDBShim.min.js',
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',

      'static/js/angular-gettext.js',
      'static/js/pdfkit.js',
      'static/js/blob-stream.js',
      'static/js/exif.js',

      'static/js/siteController.js',
      'static/js/albumController.js',
      'static/js/pageController.js',
      'static/js/canvasController.js',
      'static/js/imageLoaderController.js',
      'static/js/layoutController.js',
      'static/js/textController.js',
      'static/js/services.js',
      'static/js/layoutFac.js',

      'test/spec/beforeeach.js',
      'test/spec/**/*.spec.js',
    ],


    // list of files to exclude
    exclude: [
      '**/*.swp'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    //browsers: ['PhantomJS', 'Firefox'],
    //browsers: ['Firefox'],
    browsers: ['PhantomJS'],
  });
};
