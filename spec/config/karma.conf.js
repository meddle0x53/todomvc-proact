module.exports = function(karma) {
  karma.set({
    basePath: '../..',
    frameworks: ['jasmine'],

    files: [
      'bower_components/todomvc-common/base.js',
      'bower_components/proact.js/dist/js/proact.js',
      'js/patches/patch.js',
      'js/mvc/model.js',
      'js/mvc/models.js',
      'js/app.js',
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

