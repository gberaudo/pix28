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

      'static/js/**/*.js',
      'static/lib/**/*.js',

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
