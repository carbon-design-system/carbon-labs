/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

exports.config = {
  tests:
    './components/global-header/src/components/HybridIpaasHeader/__codecept__/*.spec.js',
  output: './codecept/screenshots',
  helpers: {
    WebDriver: {
      url: 'http://localhost:6007',
      show: false,
      browser: 'chrome',
      desiredCapabilities: {
        chromeOptions: {
          args: [
            '--headless',
            '--disable-gpu',
            '--no-sandbox',
            '--window-size=1440,700',
          ],
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
