/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export enum FEEDBACK_TYPE {
  HAP = 'HAP',
  PII = 'PII',
  SOCIAL_BIAS = 'SOCIAL_BIAS',
  NOT_TRUTH = 'NOT_TRUTH',
  TABOO_TOPIC = 'TABOO_TOPIC',
  OTHER = 'OTHER',
}

export type FeedbackData = {
  feedback_id: string;
  generation_id: string;
  start_index: number;
  end_index: number;
  selected_text: string;
  suggested_text: string;
  feedback_type: string[];
  comment: string;
};

export const FeedbackDescription = {
  HAP: 'Contains HAP (e.g. hate, abusive language, profanity)',
  PII: 'Contains PII (e.g. SSN, VIN, personal address)',
  SOCIAL_BIAS:
    'Contains social bias (e.g. race, religion, social status, etc.)',
  NOT_TRUTH: 'Isn’t truthful/honest',
  TABOO_TOPIC: 'Contains Taboo Topics (eg. religion, politics etc.)',
  OTHER: 'Other problem (please provide comment)',
};

export const ModalData = {
  heading: 'Help Us Improve: AI Content Feedback',
  notificationSubtitle:
    'Please help us improve our generative AI content by providing feedback. Your input will shape our future content and AI models. We appreciate your participation!',
};
