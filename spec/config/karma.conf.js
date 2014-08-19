module.exports = function(karma) {
  karma.set({
    basePath: '../..',
    frameworks: ['jasmine'],

    files: [
      'js/**/*.js',
      'spec/spec_helper.js',
      'spec/unit/**/*.spec.js'
    ],

    browsers: ['PhantomJS'],
    captureTimeout: 5000,
    singleRun: true,
    reportSlowerThan: 500,

    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-phantomjs-launcher'
    ]
  });
};

