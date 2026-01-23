exports.config = {
  tests:
    './components/global-header/src/components/HybridIpaasHeader/__codecept__/*.spec.js',
  output: './codecept/screenshots',
  helpers: {
    WebDriver: {
      url: 'http://localhost:6007',
      show: true,
      browser: 'chrome',
      desiredCapabilities: {
        chromeOptions: {
          args: ['--headless', '--disable-gpu', '--no-sandbox'],
        },
      },
    },
  },
  bootstrap: null,
  mocha: {},
  name: 'wc-global-header',
  plugins: {
    pauseOnFail: {},
    retryFailedStep: {
      enabled: true,
    },
    tryTo: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
    },
  },
};
