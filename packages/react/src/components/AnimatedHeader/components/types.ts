/**
 * @license
 *
 * Copyright IBM Corp. 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Supported data attributes for IBM Carbon autotrack instrumentation.
 * These attributes enable automatic tracking and analytics for user interactions.
 *
 * @see https://pages.github.ibm.com/carbon/ibm-products/developing/instrumentation/autotrack/#supported-data-attributes
 */
export type AutotrackDataAttributes = {
  'data-autotrack-accountgroup'?: string;
  'data-autotrack-accountgroupname'?: string;
  'data-autotrack-accountgroupowner'?: string;
  'data-autotrack-accountgroupstate'?: string;
  'data-autotrack-accountguid'?: string;
  'data-autotrack-accountid'?: string;
  'data-autotrack-accountidcountrycode'?: string;
  'data-autotrack-accountidcustnum_rdcctrynum'?: string;
  'data-autotrack-accountidibmcustomernumber'?: string;
  'data-autotrack-accountidsapcustnum'?: string;
  'data-autotrack-accountidsapsiteid'?: string;
  'data-autotrack-accountidtype'?: string;
  'data-autotrack-accountlevel'?: string;
  'data-autotrack-accountname'?: string;
  'data-autotrack-accountowner'?: string;
  'data-autotrack-accountplan'?: string;
  'data-autotrack-accountstatus'?: string;
  'data-autotrack-action'?: string;
  'data-autotrack-actiontype'?: string;
  'data-autotrack-agentid'?: string;
  'data-autotrack-agentname'?: string;
  'data-autotrack-agenttype'?: string;
  'data-autotrack-altuserid'?: string;
  'data-autotrack-anonymousid'?: string;
  'data-autotrack-category'?: string;
  'data-autotrack-channel'?: string;
  'data-autotrack-channelname'?: string;
  'data-autotrack-chargeagreementnumber'?: string;
  'data-autotrack-cloudenvironment'?: string;
  'data-autotrack-code'?: string;
  'data-autotrack-color'?: string;
  'data-autotrack-commonmilestonename'?: string;
  'data-autotrack-commonmilestonetriggeruserid'?: string;
  'data-autotrack-context_device_id'?: string;
  'data-autotrack-context_page_path'?: string;
  'data-autotrack-context_page_referrer'?: string;
  'data-autotrack-context_page_title'?: string;
  'data-autotrack-context_page_url'?: string;
  'data-autotrack-cta'?: string;
  'data-autotrack-customerid'?: string;
  'data-autotrack-data'?: string;
  'data-autotrack-datacenter'?: string;
  'data-autotrack-distributorid'?: string;
  'data-autotrack-elementid'?: string;
  'data-autotrack-enterpriseaccount'?: string;
  'data-autotrack-enterpriseaccountdomain'?: string;
  'data-autotrack-enterpriseaccountflag'?: string;
  'data-autotrack-enterpriseaccountname'?: string;
  'data-autotrack-enterpriseaccountstate'?: string;
  'data-autotrack-enterpriseowner'?: string;
  'data-autotrack-environment'?: string;
  'data-autotrack-environmenttype'?: string;
  'data-autotrack-eventid'?: string;
  'data-autotrack-field'?: string;
  'data-autotrack-frequency'?: string;
  'data-autotrack-hyperscalerchannel'?: string;
  'data-autotrack-hyperscalerformat'?: string;
  'data-autotrack-hyperscalerproductid'?: string;
  'data-autotrack-hyperscalerprovider'?: string;
  'data-autotrack-hyperscalertier'?: string;
  'data-autotrack-instancebssfirstbillabledate'?: string;
  'data-autotrack-instanceguid'?: string;
  'data-autotrack-instanceid'?: string;
  'data-autotrack-instancemetricspaidmilestoneintermediateusagecount'?: string;
  'data-autotrack-instancemetricspaidmilestoneintermediateusagelastts'?: string;
  'data-autotrack-instancename'?: string;
  'data-autotrack-isibmer'?: string;
  'data-autotrack-kubernetesdistribution'?: string;
  'data-autotrack-kubernetesdistributionversion'?: string;
  'data-autotrack-kubernetesid'?: string;
  'data-autotrack-kubernetesnamespace'?: string;
  'data-autotrack-kubernetesresourceapi'?: string;
  'data-autotrack-kubernetesresourcename'?: string;
  'data-autotrack-kubernetesversion'?: string;
  'data-autotrack-label'?: string;
  'data-autotrack-locale'?: string;
  'data-autotrack-location'?: string;
  'data-autotrack-marketplace'?: string;
  'data-autotrack-message'?: string;
  'data-autotrack-milestonename'?: string;
  'data-autotrack-name'?: string;
  'data-autotrack-namespace'?: string;
  'data-autotrack-object'?: string;
  'data-autotrack-objecttype'?: string;
  'data-autotrack-observetype'?: string;
  'data-autotrack-offeringid'?: string;
  'data-autotrack-openshiftclusterid'?: string;
  'data-autotrack-openshiftinfrastructurename'?: string;
  'data-autotrack-openshiftplatform'?: string;
  'data-autotrack-openshiftversion'?: string;
  'data-autotrack-operationalid'?: string;
  'data-autotrack-orgguid'?: string;
  'data-autotrack-orgname'?: string;
  'data-autotrack-originalmessageid'?: string;
  'data-autotrack-pagename'?: string;
  'data-autotrack-pagepathurl'?: string;
  'data-autotrack-pagesubject'?: string;
  'data-autotrack-pagetitle'?: string;
  'data-autotrack-pageurl'?: string;
  'data-autotrack-parentpagecategory'?: string;
  'data-autotrack-parentpagename'?: string;
  'data-autotrack-partids'?: string;
  'data-autotrack-partname'?: string;
  'data-autotrack-partnumber'?: string;
  'data-autotrack-path'?: string;
  'data-autotrack-payload'?: string;
  'data-autotrack-platformtitle'?: string;
  'data-autotrack-previousproductversion'?: string;
  'data-autotrack-productcode'?: string;
  'data-autotrack-productcodetype'?: string;
  'data-autotrack-productid'?: string;
  'data-autotrack-productplan'?: string;
  'data-autotrack-productplanname'?: string;
  'data-autotrack-productplantier'?: string;
  'data-autotrack-productplantype'?: string;
  'data-autotrack-productstatus'?: string;
  'data-autotrack-producttitle'?: string;
  'data-autotrack-productversion'?: string;
  'data-autotrack-quantity'?: string;
  'data-autotrack-region'?: string;
  'data-autotrack-resellerid'?: string;
  'data-autotrack-resultvalue'?: string;
  'data-autotrack-roles'?: string;
  'data-autotrack-sabasubscriptionid'?: string;
  'data-autotrack-saletype'?: string;
  'data-autotrack-sapsiteid'?: string;
  'data-autotrack-segmentsourceslug'?: string;
  'data-autotrack-serviceagreementnumber'?: string;
  'data-autotrack-sessionid'?: string;
  'data-autotrack-size'?: string;
  'data-autotrack-source'?: string;
  'data-autotrack-subproducttitle'?: string;
  'data-autotrack-subscriptionid'?: string;
  'data-autotrack-successflag'?: string;
  'data-autotrack-tenantid'?: string;
  'data-autotrack-tenantname'?: string;
  'data-autotrack-text'?: string;
  'data-autotrack-type'?: string;
  'data-autotrack-uielement'?: string;
  'data-autotrack-unit'?: string;
  'data-autotrack-unitdescription'?: string;
  'data-autotrack-url'?: string;
  'data-autotrack-urlsubdomain'?: string;
  'data-autotrack-usersessionid'?: string;
  'data-autotrack-ut10'?: string;
  'data-autotrack-ut15'?: string;
  'data-autotrack-ut17'?: string;
  'data-autotrack-ut20'?: string;
  'data-autotrack-ut30'?: string;
  'data-autotrack-ut30_description'?: string;
  'data-autotrack-ut35'?: string;
  'data-autotrack-ut40'?: string;
  'data-autotrack-utlvlcd'?: string;
  'data-autotrack-variation'?: string;
  'data-autotrack-version'?: string;
};

// Made with Bob
