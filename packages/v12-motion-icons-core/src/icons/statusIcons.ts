/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Status-capable icons: the 26 curated icons that take a
 * status on their own export, `<Save status="success" />`,
 * `<Notification count={3} />`. With no status each is exactly its plain
 * icon (the same drawing and hover; statusIdentity.test.tsx proves it).
 *
 * Two groups:
 *  - Process icons take what a process is doing: success, warning, error,
 *    pending. The mark sits in Carbon's bottom-right slot (x 18–30, y 18–30).
 *    (Download, Upload and Export are plain hover icons: the mark isn't
 *    useful on them.)
 *  - Notification icons take a notification pip, or a count in a pill,
 *    top right where Carbon puts its pip (notification--new: r 4 at 26,8).
 *    Email too, though Carbon's email--new puts its pip bottom right: one
 *    corner for every pip and count (consistency over Carbon's one-off).
 *
 * The cut is the status layer's (utils/statusLayer.ts): every wall ends
 * square where it first comes within 4px of the mark, at rest and through
 * every frame. Hand fixes for the icons the generic cut leaves a broken part
 * on are in statusFixes.ts, one export per icon. While a status shows the icon holds still on
 * hover (statusLayer.ts, makeStatusIcon).
 */
import CheckmarkOutlineWarning32 from '@carbon/icons/es/checkmark--outline--warning/32.js';
import CheckmarkOutlineError32 from '@carbon/icons/es/checkmark--outline--error/32.js';
import CheckmarkFilledWarning32 from '@carbon/icons/es/checkmark--filled--warning/32.js';
import CheckmarkFilledError32 from '@carbon/icons/es/checkmark--filled--error/32.js';
import InProgressWarning32 from '@carbon/icons/es/in-progress--warning/32.js';
import InProgressError32 from '@carbon/icons/es/in-progress--error/32.js';
import IncompleteWarning32 from '@carbon/icons/es/incomplete--warning/32.js';
import IncompleteError32 from '@carbon/icons/es/incomplete--error/32.js';
import { DEV } from '../dev';
import {
  aliasOf,
  carbonArt,
  type AliasIconSpec,
  type HoverIconSpec,
  statusIcon,
  type BaseGeo,
  type Placement,
  type ProcessStatus,
  type StatusIconDataSpec,
  type StatusSpec,
} from '../engine';
import { CopySpec as CopyPlain } from './formatting/fmtTools';
import { SaveSpec as SavePlain } from './formatting/editing';
import {
  SettingsSpec as SettingsPlain,
  settingsShapes,
  SETTINGS_HOVER,
} from './controls/Settings';
import {
  CloudDownloadSpec as CloudDownloadPlain,
  CloudUploadSpec as CloudUploadPlain,
  DocumentSpec as DocumentPlain,
  DocumentExportSpec as DocumentExportPlain,
  DocumentImportSpec as DocumentImportPlain,
  ShareSpec as SharePlain,
} from './operations/transfer';
import { RenewSpec as RenewPlain } from './operations/opsRotate';
import { SendSpec as SendPlain } from './operations/opsMisc';
import { ChatSpec as ChatPlain } from './operations/opsLast';
import { FolderSpec as FolderPlain } from './toggle/deviceToggles';
import {
  ActivitySpec as ActivityPlain,
  DataBaseSpec as DataBasePlain,
} from './data/data-a';
import {
  EmailSpec as EmailPlain,
  PrinterSpec as PrinterPlain,
} from './assorted/objectsA';
import { ShoppingCartSpec as ShoppingCartPlain } from './assorted/objectsB';
import {
  UserSpec as UserPlain,
  UserAvatarSpec as UserAvatarPlain,
} from './people/people';
import {
  CalendarSpec as CalendarPlain,
  IncompleteSpec as IncompletePlain,
} from './status/carbonInternals';
import { CheckmarkOutlineSpec as CheckmarkOutlinePlain } from './status/CheckmarkOutline';
import {
  CheckmarkFilledSpec as CheckmarkFilledPlain,
  InProgressSpec as InProgressPlain,
} from './status/states';
import {
  checkmarkFilledBadge,
  checkmarkOutlineBadge,
  incompleteBadge,
  inProgressBadge,
} from './status/statusBadges';
import { NotificationSpec as NotificationPlain } from './toggle/toggleViews';
import { notificationShapes } from './toggle/stateToggles';
import {
  activityPlacement,
  calendarPlacement,
  cloudDownloadPlacement,
  cloudUploadPlacement,
  documentExportPlacement,
  documentImportPlacement,
  emailPlacement,
  renewPlacement,
  sendPlacement,
  sharePlacement,
  shoppingCartPlacement,
  userAvatarPlacement,
  userPlacement,
} from './statusFixes';

export const PROCESS_STATUSES = [
  'success',
  'warning',
  'error',
  'pending',
] as const satisfies readonly ProcessStatus[];
export const NOTIFICATION_STATUSES = ['notification'] as const;
/** CheckmarkOutline's and CheckmarkFilled's: no success (the icon already says it). */
export const CHECK_STATUSES = [
  'warning',
  'error',
  'pending',
] as const satisfies readonly ProcessStatus[];

/** Carbon's notification--new pip: r 4 at (26, 8). */
const PIP_TR: Placement = { corner: 'tr', inset: [2, 4] };

/** A process icon: success, warning, error, pending. */
export type ProcessStatusIcon = StatusIconDataSpec<ProcessStatus>;
/** A check icon (CheckmarkOutline, CheckmarkFilled): warning, error, pending. */
export type CheckStatusIcon = StatusIconDataSpec<
  (typeof CHECK_STATUSES)[number]
>;
/** A notification icon: a pip, or a count. */
export type CountStatusIcon = StatusIconDataSpec<'notification'>;

type Plain = HoverIconSpec;
/* @__NO_SIDE_EFFECTS__ */
function geoOf(B: Plain): BaseGeo {
  return B.geo as BaseGeo;
}

/*
 * The factories are side-effect free (each builds a component from its
 * arguments and touches nothing else), and say so: without the annotation a
 * bundler keeps every icon's call at module load, so importing one icon
 * from this module built all of them (and their plain icons).
 */
/* @__NO_SIDE_EFFECTS__ */
function processIcon(
  name: string,
  B: Plain,
  fixes: Partial<Placement> = {},
  geo: BaseGeo = geoOf(B),
  extra: Pick<StatusSpec, 'hover' | 'leave'> = {}
): ProcessStatusIcon {
  return statusIcon(name, B, {
    statuses: PROCESS_STATUSES,
    placement: { ...fixes },
    geo,
    hover: B.hover,
    ...extra,
  });
}
/** A check icon: the process statuses but success, which it already says. */
/* @__NO_SIDE_EFFECTS__ */
function checkIcon(
  name: string,
  B: Plain,
  fixes: Partial<Placement>,
  geo: BaseGeo
): CheckStatusIcon {
  return statusIcon(name, B, {
    statuses: CHECK_STATUSES,
    placement: { ...fixes },
    geo,
    hover: B.hover,
    refused: DEV ? { success: 'the icon is a check already' } : undefined,
  });
}
/* @__NO_SIDE_EFFECTS__ */
function countIcon(
  name: string,
  B: Plain,
  fixes: Partial<Placement> = {},
  geo: BaseGeo = geoOf(B)
): CountStatusIcon {
  // Inside, one figure at most on every count icon (a two-figure pill inside takes Chat's text
  // lines, Email's flap, half the bell, the calendar's box, the cart's upper left); wider counts overhang.
  return statusIcon(name, B, {
    statuses: NOTIFICATION_STATUSES,
    count: true,
    placement: { ...PIP_TR, insideMax: '9', ...fixes },
    geo,
    hover: B.hover,
  });
}

// ── A. Process icons ─────────────────────────────────────────────────────────

export const RenewSpec = /* @__PURE__ */ processIcon(
  'Renew',
  RenewPlain,
  renewPlacement
);
export const CopySpec = /* @__PURE__ */ processIcon('Copy', CopyPlain);
export const SettingsSpec = /* @__PURE__ */ processIcon(
  'Settings',
  SettingsPlain,
  {},
  settingsShapes as BaseGeo,
  { hover: SETTINGS_HOVER, leave: SETTINGS_HOVER }
);
export const SaveSpec = /* @__PURE__ */ processIcon('Save', SavePlain);
export const DocumentSpec = /* @__PURE__ */ processIcon(
  'Document',
  DocumentPlain
);
export const SendSpec = /* @__PURE__ */ processIcon(
  'Send',
  SendPlain,
  sendPlacement
);
export const ShareSpec = /* @__PURE__ */ processIcon(
  'Share',
  SharePlain,
  sharePlacement
);
export const FolderSpec = /* @__PURE__ */ processIcon('Folder', FolderPlain);
export const DocumentImportSpec = /* @__PURE__ */ processIcon(
  'DocumentImport',
  DocumentImportPlain,
  documentImportPlacement
);
export const DocumentExportSpec = /* @__PURE__ */ processIcon(
  'DocumentExport',
  DocumentExportPlain,
  documentExportPlacement
);
export const DataBaseSpec = /* @__PURE__ */ processIcon(
  'DataBase',
  DataBasePlain
);
/** A jobs indicator's icon: idle, then pending while jobs run, then how the last one ended. */
export const ActivitySpec = /* @__PURE__ */ processIcon(
  'Activity',
  ActivityPlain,
  activityPlacement
);
export const PrinterSpec = /* @__PURE__ */ processIcon('Printer', PrinterPlain);
export const CloudUploadSpec = /* @__PURE__ */ processIcon(
  'CloudUpload',
  CloudUploadPlain,
  cloudUploadPlacement
);
export const CloudDownloadSpec = /* @__PURE__ */ processIcon(
  'CloudDownload',
  CloudDownloadPlain,
  cloudDownloadPlacement
);

// ── A2. The status checkmarks ────────────────────────────────────────────────
//
// Process icons whose status drawings Carbon ships (checkmark--outline--warning,
// checkmark--filled--error, in-progress--warning, incomplete--error, …): at rest
// with a status each is Carbon's drawing. The base settles into Carbon's badge
// drawing as the cut opens (statusBadges.ts), and the cut is Carbon's: the rings
// a box (their quarter, square ends), the filled disc and the in-progress ring
// the mark's outline grown by 3 (Carbon's 2, plus 1) and run
// out to the corner. The two checks take no success: the icon already says it.

/** Carbon's cut on the outline rings (checkmark--outline--*, incomplete--*): the slot's box, 4 clear of it. */
const BOX: Partial<Placement> = { mode: 'box', gap: 4 };
/** The cut on the filled disc and the in-progress ring (checkmark--filled--*, in-progress--*): the mark's outline grown by 3 (Carbon's 2, 1px more for the space). */
const OFFSET: Partial<Placement> = { mode: 'offset', gap: 3 };

export const CheckmarkOutlineSpec = /* @__PURE__ */ checkIcon(
  'CheckmarkOutline',
  CheckmarkOutlinePlain,
  BOX,
  /* @__PURE__ */ checkmarkOutlineBadge(geoOf(CheckmarkOutlinePlain))
);
export const CheckmarkFilledSpec = /* @__PURE__ */ checkIcon(
  'CheckmarkFilled',
  CheckmarkFilledPlain,
  OFFSET,
  /* @__PURE__ */ checkmarkFilledBadge(geoOf(CheckmarkFilledPlain))
);
export const InProgressSpec = /* @__PURE__ */ processIcon(
  'InProgress',
  InProgressPlain,
  OFFSET,
  /* @__PURE__ */ inProgressBadge(geoOf(InProgressPlain))
);
export const IncompleteSpec = /* @__PURE__ */ processIcon(
  'Incomplete',
  IncompletePlain,
  BOX,
  /* @__PURE__ */ incompleteBadge(geoOf(IncompletePlain))
);

// Carbon's static status drawings, as names: each is its base with the status fixed
// (`<CheckmarkFilledWarning />` draws `<CheckmarkFilled status="warning" />`). Unlike the
// status-capable bases they hover, as Carbon's badges do (the batch-3 warning and error
// badges' motion: the base holds, the mark grows, the cut keeping its gap), and with motion
// off they draw Carbon's own art.

/** Carbon's `checkmark--outline--warning`: `<CheckmarkOutline status="warning" />`. */
export const CheckmarkOutlineWarningSpec = /* @__PURE__ */ aliasOf(
  'CheckmarkOutlineWarning',
  CheckmarkOutlineSpec,
  { status: 'warning' },
  /* @__PURE__ */ carbonArt(CheckmarkOutlineWarning32)
);
/** Carbon's `checkmark--outline--error`: `<CheckmarkOutline status="error" />`. */
export const CheckmarkOutlineErrorSpec = /* @__PURE__ */ aliasOf(
  'CheckmarkOutlineError',
  CheckmarkOutlineSpec,
  { status: 'error' },
  /* @__PURE__ */ carbonArt(CheckmarkOutlineError32)
);
/** Carbon's `checkmark--filled--warning`: `<CheckmarkFilled status="warning" />`. */
export const CheckmarkFilledWarningSpec = /* @__PURE__ */ aliasOf(
  'CheckmarkFilledWarning',
  CheckmarkFilledSpec,
  { status: 'warning' },
  /* @__PURE__ */ carbonArt(CheckmarkFilledWarning32)
);
/** Carbon's `checkmark--filled--error`: `<CheckmarkFilled status="error" />`. */
export const CheckmarkFilledErrorSpec = /* @__PURE__ */ aliasOf(
  'CheckmarkFilledError',
  CheckmarkFilledSpec,
  { status: 'error' },
  /* @__PURE__ */ carbonArt(CheckmarkFilledError32)
);
/** Carbon's `in-progress--warning`: `<InProgress status="warning" />`. */
export const InProgressWarningSpec = /* @__PURE__ */ aliasOf(
  'InProgressWarning',
  InProgressSpec,
  { status: 'warning' },
  /* @__PURE__ */ carbonArt(InProgressWarning32)
);
/** Carbon's `in-progress--error`: `<InProgress status="error" />`. */
export const InProgressErrorSpec = /* @__PURE__ */ aliasOf(
  'InProgressError',
  InProgressSpec,
  { status: 'error' },
  /* @__PURE__ */ carbonArt(InProgressError32)
);
/** Carbon's `incomplete--warning`: `<Incomplete status="warning" />`. */
export const IncompleteWarningSpec = /* @__PURE__ */ aliasOf(
  'IncompleteWarning',
  IncompleteSpec,
  { status: 'warning' },
  /* @__PURE__ */ carbonArt(IncompleteWarning32)
);
/** Carbon's `incomplete--error`: `<Incomplete status="error" />`. */
export const IncompleteErrorSpec = /* @__PURE__ */ aliasOf(
  'IncompleteError',
  IncompleteSpec,
  { status: 'error' },
  /* @__PURE__ */ carbonArt(IncompleteError32)
);

/** A status alias: its base with the status fixed. */
export type StatusAliasIcon = AliasIconSpec<
  ProcessStatusIcon | CheckStatusIcon
>;

// ── B. Notification icons ────────────────────────────────────────────────────

export const UserAvatarSpec = /* @__PURE__ */ countIcon(
  'UserAvatar',
  UserAvatarPlain,
  userAvatarPlacement
);
export const UserSpec = /* @__PURE__ */ countIcon(
  'User',
  UserPlain,
  userPlacement
);
export const NotificationSpec = /* @__PURE__ */ countIcon(
  'Notification',
  NotificationPlain,
  {},
  ((f, size) => notificationShapes({ h: f.h, p: 0, e: 0 }, size)) as BaseGeo
);
export const ChatSpec = /* @__PURE__ */ countIcon('Chat', ChatPlain);
export const CalendarSpec = /* @__PURE__ */ countIcon(
  'Calendar',
  CalendarPlain,
  calendarPlacement
);
export const EmailSpec = /* @__PURE__ */ countIcon(
  'Email',
  EmailPlain,
  emailPlacement
);
export const ShoppingCartSpec = /* @__PURE__ */ countIcon(
  'ShoppingCart',
  ShoppingCartPlain,
  shoppingCartPlacement
);

/** Every status-capable icon by name, with its group: for the gallery, the docs and the tests. */
export const STATUS_ICONS = {
  Renew: RenewSpec,
  Copy: CopySpec,
  Settings: SettingsSpec,
  Save: SaveSpec,
  Document: DocumentSpec,
  Send: SendSpec,
  Share: ShareSpec,
  Folder: FolderSpec,
  DocumentImport: DocumentImportSpec,
  DocumentExport: DocumentExportSpec,
  DataBase: DataBaseSpec,
  Activity: ActivitySpec,
  Printer: PrinterSpec,
  CloudUpload: CloudUploadSpec,
  CloudDownload: CloudDownloadSpec,
  CheckmarkOutline: CheckmarkOutlineSpec,
  CheckmarkFilled: CheckmarkFilledSpec,
  InProgress: InProgressSpec,
  Incomplete: IncompleteSpec,
  UserAvatar: UserAvatarSpec,
  User: UserSpec,
  Notification: NotificationSpec,
  Chat: ChatSpec,
  Calendar: CalendarSpec,
  Email: EmailSpec,
  ShoppingCart: ShoppingCartSpec,
} as const;
export const PROCESS_ICONS = [
  'Renew',
  'Copy',
  'Settings',
  'Save',
  'Document',
  'Send',
  'Share',
  'Folder',
  'DocumentImport',
  'DocumentExport',
  'DataBase',
  'Activity',
  'Printer',
  'CloudUpload',
  'CloudDownload',
  'CheckmarkOutline',
  'CheckmarkFilled',
  'InProgress',
  'Incomplete',
] as const;
/** The status checkmarks: process icons whose status drawings Carbon ships, settling into them. */
export const CHECKMARK_ICONS = [
  'CheckmarkOutline',
  'CheckmarkFilled',
  'InProgress',
  'Incomplete',
] as const;
/** Carbon's static status names: each alias, its base and the status it fixes, and Carbon's icon name. */
export const STATUS_ALIASES = {
  CheckmarkOutlineWarning: {
    base: 'CheckmarkOutline',
    status: 'warning',
    carbon: 'checkmark--outline--warning',
  },
  CheckmarkOutlineError: {
    base: 'CheckmarkOutline',
    status: 'error',
    carbon: 'checkmark--outline--error',
  },
  CheckmarkFilledWarning: {
    base: 'CheckmarkFilled',
    status: 'warning',
    carbon: 'checkmark--filled--warning',
  },
  CheckmarkFilledError: {
    base: 'CheckmarkFilled',
    status: 'error',
    carbon: 'checkmark--filled--error',
  },
  InProgressWarning: {
    base: 'InProgress',
    status: 'warning',
    carbon: 'in-progress--warning',
  },
  InProgressError: {
    base: 'InProgress',
    status: 'error',
    carbon: 'in-progress--error',
  },
  IncompleteWarning: {
    base: 'Incomplete',
    status: 'warning',
    carbon: 'incomplete--warning',
  },
  IncompleteError: {
    base: 'Incomplete',
    status: 'error',
    carbon: 'incomplete--error',
  },
} as const;
export const NOTIFICATION_ICONS = [
  'UserAvatar',
  'User',
  'Notification',
  'Chat',
  'Calendar',
  'Email',
  'ShoppingCart',
] as const;
