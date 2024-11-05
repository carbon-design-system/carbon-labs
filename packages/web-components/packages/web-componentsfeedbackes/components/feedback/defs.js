/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
export var FEEDBACK_TYPE;
(function (FEEDBACK_TYPE) {
  FEEDBACK_TYPE["HAP"] = "HAP";
  FEEDBACK_TYPE["PII"] = "PII";
  FEEDBACK_TYPE["SOCIAL_BIAS"] = "SOCIAL_BIAS";
  FEEDBACK_TYPE["NOT_TRUTH"] = "NOT_TRUTH";
  FEEDBACK_TYPE["TABOO_TOPIC"] = "TABOO_TOPIC";
  FEEDBACK_TYPE["OTHER"] = "OTHER";
})(FEEDBACK_TYPE || (FEEDBACK_TYPE = {}));
export const FeedbackDescription = {
  HAP: 'Contains HAP (e.g. hate, abusive language, profanity)',
  PII: 'Contains PII (e.g. SSN, VIN, personal address)',
  SOCIAL_BIAS: 'Contains social bias (e.g. race, religion, social status, etc.)',
  NOT_TRUTH: 'Isn’t truthful/honest',
  TABOO_TOPIC: 'Contains Taboo Topics (eg. religion, politics etc.)',
  OTHER: 'Other problem (please provide comment)'
};
export const ModalData = {
  heading: 'Help Us Improve: AI Content Feedback',
  notificationSubtitle: 'Please help us improve our generative AI content by providing feedback. Your input will shape our future content and AI models. We appreciate your participation!'
};
//# sourceMappingURL=defs.js.map
