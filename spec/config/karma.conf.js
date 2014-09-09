module.exports = function(karma) {
  karma.set({
    basePath: '../..',
    frameworks: ['jasmine'],

    files: [
      'bower_components/todomvc-common/base.js',
      'js/lib/proact.js',
      'bower_components/zepto/zepto.js',
      'js/patches/patch.js',
      'js/mvs/initialize.js',
      'js/mvs/storage.js',
      'js/mvs/model.js',
      'js/mvs/models.js',
      'js/mvs/view.js',
      'js/mvs/new_view.js',
      'js/mvs/views.js',
      'js/mvs/router.js',
      'js/app.js',
      'spec/spec_helper.js',
      'spec/unit/**/*.spec.js',
      'spec/integration/**/*.spec.js',
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

