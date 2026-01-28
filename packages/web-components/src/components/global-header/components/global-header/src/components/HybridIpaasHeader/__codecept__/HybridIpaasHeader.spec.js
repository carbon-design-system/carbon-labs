/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* global Feature */
/* global Scenario */
/* global locate */

Feature('HybridIpaasHeader');
const localhost =
  'http://localhost:6007/iframe.html?globals=&args=&id=components-global-header-subcomponents-webmethods-hybrid-integration-header--basic&viewMode=story';
const localhostWithChat =
  'http://localhost:6007/iframe.html?globals=&args=&id=components-global-header-subcomponents-webmethods-hybrid-integration-header--with-ai-chat&viewMode=story';
const localhostWithSearch =
  'http://localhost:6007/iframe.html?globals=&args=&id=components-global-header-subcomponents-webmethods-hybrid-integration-header--search-callback&viewMode=story';
const localhostWithTrial =
  'http://localhost:6007/iframe.html?globals=&args=&id=components-global-header-subcomponents-webmethods-hybrid-integration-header--basic-with-trial&viewMode=story';
const localhostWithCustomFooter =
  'http://localhost:6007/iframe.html?globals=&args=&id=components-global-header-subcomponents-webmethods-hybrid-integration-header--custom-footer&viewMode=story';
  const localhostWithSolis = 'http://localhost:6007/iframe.html?globals=&args=&id=components-global-header-subcomponents-webmethods-hybrid-integration-header--with-solis&viewMode=story';

Scenario('It checks the header content', async ({ I }) => {
  I.amOnPage(localhost);
  I.waitForElement('#ipaas-header-container', 30); // Add some wait time for the page to fully load
  I.waitForElement('.ibm-automation-cds__header-name');
  I.seeElement('.ibm-automation-cds__header-name');
  I.waitForText('webMethods Hybrid Integration');
  I.seeElement('.ibm-automation-cds__capability-name');
  I.waitForVisible('.ibm-automation-cds__capability-name');
  I.waitForText('App Connect');
  I.see('App Connect');
});

Scenario(
  'Environment switcher menu renders and opens menu when clicked',
  async ({ I }) => {
    I.amOnPage(localhost);
    I.waitForElement('clabs-global-header-apaas', 30);

    I.seeElement('clabs-global-header-switcher-component');
    I.click('clabs-global-header-switcher-component');

    I.see('Development');
    I.see('eyebeemdev', 'a');
  }
);

Scenario(
  'Capability menu renders and opens menu when clicked',
  async ({ I }) => {
    I.amOnPage(localhost);
    I.waitForElement('clabs-global-header-apaas', 30);
    I.seeElement('cds-custom-header-menu-button');
    I.click('cds-custom-header-menu-button');

    // Home
    I.see('Home', 'a');
    // Capabilities
    I.see('Hybrid control plane', 'button');
    I.see('API Connect', 'a');
    I.see('App Connect', 'a');
    // Admin
    I.see('Administration', 'button');
    I.see('Access management', 'a');
  }
);

Scenario('Notifications action renders', async ({ I }) => {
  I.amOnPage(localhost);
  I.waitForElement('clabs-global-header-apaas', 30);

  /*
   * Currently it looks like the class is the only way of identifying the notification button
   * This may need to be given a testid to be less brittle
   */
  I.seeElement(locate('.automation-global-header__notification'), 'a');
});

Scenario('Assist me action renders', async ({ I }) => {
  I.amOnPage(localhostWithChat);
  I.waitForElement('clabs-global-header-apaas', 30);

  /*
   * Currently it looks like the id is the only way of identifying the assist me button
   * This may need to be given a testid to be less brittle
   */
  const assistMeButton = locate('#ibm-automation-cds-chatbot-menu-button');
  I.seeElement(assistMeButton);
});

Scenario(
  'Profile action renders and opens menu when clicked',
  async ({ I }) => {
    I.amOnPage(localhost);
    I.waitForElement('clabs-global-header-apaas', 30);

    /*
     * Currently it looks like the class is the only way of identifying the profile button
     * This may need to be given a testid to be less brittle
     */
    const profileButton = locate('.mcsp-header-user-profile');
    I.seeElement(profileButton);
    I.click(profileButton);
    I.waitForElement('clabs-global-header-auth-context');
    I.see('Sample User');
    I.see('user@example.com');
    I.see('Product');
    I.see('App Connect');
    I.see('Log out', 'a');
  }
);

Scenario('Profile menu renders custom footer links', async ({ I }) => {
  I.amOnPage(localhostWithCustomFooter);
  I.waitForElement('clabs-global-header-apaas', 30);

  const profileButton = locate('.mcsp-header-user-profile');
  I.seeElement(profileButton);
  I.click(profileButton);
  I.wait(3);

  I.see('About us');
  I.see('Helpful link');
  I.see('Log out');
});

Scenario('Search action renders', async ({ I }) => {
  I.amOnPage(localhostWithSearch);
  I.waitForElement('clabs-global-header-apaas', 30);

  const searchButton = locate('clabs-global-header-search');
  I.seeElement(searchButton);
  I.click(searchButton);
  I.seeElement('.cds-custom--search-input');

  I.type('hello');
  I.seeElement('.cds-custom--search-close');
  I.click('.cds-custom--search-close');
  I.dontSee('hello');
});

Scenario('Trial information renders', async ({ I }) => {
  I.amOnPage(localhostWithTrial);
  I.waitForElement('clabs-global-header-apaas', 30);

  I.seeElement(locate('clabs-global-header-trial-popover'));
  I.see('30');
  I.see('Trial days left');
  I.click('.automation-global-header__trial-menu');
  I.seeElement('.automation-header__tooltip-body');
  I.see('Your trial ends on');
  I.see('Request trial extension');
  I.see('Contact sales');
});

Scenario('Solis components render', async ({ I }) => {
  I.amOnPage(localhostWithSolis);
  I.waitForElement('clabs-global-header-apaas', 30);

  I.seeElement(locate('solis-sidekick'));
  I.click(locate('solis-sidekick'));
  I.seeElement('.sidekick-body');
  I.see('Overview');
  I.see('Analyze this page');
  I.see('Insights');

  I.seeElement(locate('solis-switcher'));
  I.click(locate('solis-switcher'));
  I.see('Observability');
  I.see('Community');
  I.click(locate('solis-switcher')); // Close the Solis switcher
  I.dontSee('Observability'); // Solis switcher is closed
})
