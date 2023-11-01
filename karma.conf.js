module.exports = function (config) {
  config.set({
    files: ['src/test.ts'], // List of files to include in the test suite
    basePath: '', // Base path for files, usually set to project root
    frameworks: ['jasmine', '@angular-devkit/build-angular'], // Testing frameworks and plugins
    plugins: [ // Karma plugins used in the configuration
      require('karma-jasmine'), // Jasmine framework
      require('karma-chrome-launcher'), // Chrome browser launcher
      require('karma-jasmine-html-reporter'), // Jasmine HTML reporter
      require('karma-coverage'), // Code coverage reporter
      require('@angular-devkit/build-angular/plugins/karma'), // Angular plugin
      // require('karma-jquery'), // jQuery plugin (used for jQuery fixtures)
      // require('karma-jasmine-jquery') // Jasmine-jQuery plugin
    ],
    client: {
      jasmine: {
        // Jasmine configuration options can be placed here
      },
      clearContext: false // Leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // Remove duplicated traces in HTML reporter
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/fd-homologation'), // Directory for coverage reports
      subdir: '.', // Subdirectory within the coverage directory
      reporters: [
        { type: 'html' }, // HTML coverage report
        { type: 'text-summary' } // Text summary coverage report
      ]
    },
    reporters: ['progress', 'kjhtml'], // Reporters used for Karma output
    port: 9876, // Port where Karma runs
    colors: true, // Enable colors in output
    logLevel: config.LOG_INFO, // Log level for Karma
    autoWatch: true, // Automatically watch files for changes
    browsers: ['Chrome'], // Browsers to use for testing
    singleRun: false, // Run tests once and exit
    restartOnFileChange: true // Restart Karma on file changes
  });
};