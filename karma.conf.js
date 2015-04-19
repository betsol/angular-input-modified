module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'expect'],
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'dist/angular-input-modified.js',
      'tests/unit/**/*.js'
    ],
    exclude: [],
    preprocessors: {},
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_DEBUG,
    autoWatch: false,
    browsers: ['Chrome', 'Firefox'],
    singleRun: false
  });
};
