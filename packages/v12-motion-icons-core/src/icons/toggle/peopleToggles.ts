/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import User16 from '@carbon/icons/es/user/16.js';
import User32 from '@carbon/icons/es/user/32.js';
import UserAvatar16 from '@carbon/icons/es/user--avatar/16.js';
import UserAvatar32 from '@carbon/icons/es/user--avatar/32.js';
import UserAvatarFilledAlt32 from '@carbon/icons/es/user--avatar--filled--alt/32.js';
import UserFilled32 from '@carbon/icons/es/user--filled/32.js';
import { carbonArt, fillThenClear, toggleIcon } from '../../engine';
import { avatarShapes, userShapes } from '../people/people';

const CUser = /* @__PURE__ */ carbonArt(User16, User32);
const CUserAvatar = /* @__PURE__ */ carbonArt(UserAvatar16, UserAvatar32);
const CUserAvatarFilledAlt = /* @__PURE__ */ carbonArt(UserAvatarFilledAlt32);
const CUserFilled = /* @__PURE__ */ carbonArt(UserFilled32);

/**
 * Outline ⇄ filled toggles for the people icons: UserToggle (User ⇄ User
 * filled) and UserAvatarToggle (User avatar ⇄ User avatar filled alt). The
 * fill grows as one disc from the head's center, filling the head and then
 * the shoulders; emptying, it clears from the same point. In either state
 * the hover is the User or User avatar icon's own. (User avatar filled, a
 * solid disc with the person cut out, is a separate hover icon.)
 */

export const UserToggleSpec = /* @__PURE__ */ toggleIcon<'off' | 'on'>(
  'UserToggle',
  {
    states: ['off', 'on'],
    statics: [CUser, CUserFilled],
    geo: ({ h, p, e }) => userShapes(h, p, e),
    change: fillThenClear,
  }
);

export const UserAvatarToggleSpec = /* @__PURE__ */ toggleIcon<'off' | 'on'>(
  'UserAvatarToggle',
  {
    states: ['off', 'on'],
    statics: [CUserAvatar, CUserAvatarFilledAlt],
    geo: ({ h, p, e }, size) => avatarShapes(h, p, e, size),
    change: fillThenClear,
  }
);
