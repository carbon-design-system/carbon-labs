/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Deprecated toggle names, kept as aliases of the one-per-family toggles.
 *
 * Every toggle is one component per family, named after its base icon,
 * with its drawing as a prop (`filled`, `variant`). The old names keep
 * working: a rename is the same component under its old name, and a name
 * whose drawing is a prop is a thin wrapper that passes it (its statics
 * are that drawing's). `TOGGLE_ALIASES` lists each old name with its
 * replacement and the props it passes; the tests check that every alias
 * draws exactly what its replacement does.
 */
import { aliasOf } from '../engine';
import { ChevronUpOutlineToggleSpec } from './assorted/assorted';
import { VolumeLevelToggleSpec } from './assorted/devicesPlaces';
import {
  BottomPanelOpenToggleSpec,
  RightPanelOpenToggleSpec,
  SidePanelOpenToggleSpec,
} from './controls/panels';
import { PlayPauseToggleSpec, RecordStopToggleSpec } from './controls/playback';
import { RowExpandToggleSpec } from './data/data-b';
import { ListToggleSpec } from './data/viewSwitch';
import { ScanAltOffToggleSpec } from './operations/scanAltDisabled';
import { FlashOffToggleSpec } from './toggle/FlashOffToggle';
import { MicrophoneOffToggleSpec } from './toggle/MicrophoneOffToggle';
import { ViewOffToggleSpec } from './toggle/ViewOffToggle';
import { CheckmarkToggleSpec } from './toggle/checkToggles';
import {
  CheckboxStateToggleSpec,
  CheckboxToggleSpec,
} from './toggle/checkboxToggles';
import { VideoOffToggleSpec } from './toggle/deviceToggles';
import {
  CaretDownToggleSpec,
  CaretLeftToggleSpec,
  ChevronDownToggleSpec,
  ChevronLeftToggleSpec,
} from './toggle/dirToggles';
import { LinkToggleSpec } from './toggle/editingToggles';
import { SendAltToggleSpec, SendToggleSpec } from './toggle/fillToggles';
import { NotificationOffToggleSpec } from './toggle/notificationOff';
import {
  AddToggleSpec,
  CloseToggleSpec,
  SendAltOffToggleSpec,
  SubtractToggleSpec,
} from './toggle/opsFillToggles';
import { NotificationToggleSpec } from './toggle/stateToggles';

/** Each deprecated toggle name: the toggle to use instead, and the props that pick the same drawing. */
export const TOGGLE_ALIASES = {
  // Renamed after the base icon (direction toggles: the icon they start on).
  ChevronDownUpToggle: { use: 'ChevronDownToggle' },
  ChevronLeftRightToggle: { use: 'ChevronLeftToggle' },
  CaretDownUpToggle: { use: 'CaretDownToggle' },
  CaretLeftRightToggle: { use: 'CaretLeftToggle' },
  ChevronUpDownOutlineToggle: { use: 'ChevronUpOutlineToggle' },
  RowExpandCollapseToggle: { use: 'RowExpandToggle' },
  SidePanelToggle: { use: 'SidePanelOpenToggle' },
  RightPanelToggle: { use: 'RightPanelOpenToggle' },
  BottomPanelToggle: { use: 'BottomPanelOpenToggle' },
  ListGridToggle: { use: 'ListToggle' },
  LinkUnlinkToggle: { use: 'LinkToggle' },
  ScanToggle: { use: 'ScanAltOffToggle' },
  // Outline ⇄ filled toggles named after their family, not their filled end.
  AddFilledToggle: { use: 'AddToggle' },
  SubtractFilledToggle: { use: 'SubtractToggle' },
  CloseFilledToggle: { use: 'CloseToggle' },
  CheckmarkFilledToggle: { use: 'CheckmarkToggle' },
  // Older aliases.
  SendToggled: { use: 'SendToggle' },
  SendAltToggled: { use: 'SendAltToggle' },
  // Filled twins: `filled`.
  SidePanelFilledToggle: {
    use: 'SidePanelOpenToggle',
    props: { filled: true },
  },
  RightPanelFilledToggle: {
    use: 'RightPanelOpenToggle',
    props: { filled: true },
  },
  BottomPanelFilledToggle: {
    use: 'BottomPanelOpenToggle',
    props: { filled: true },
  },
  FlashOffFilledToggle: { use: 'FlashOffToggle', props: { filled: true } },
  MicrophoneOffFilledToggle: {
    use: 'MicrophoneOffToggle',
    props: { filled: true },
  },
  ViewOffFilledToggle: { use: 'ViewOffToggle', props: { filled: true } },
  NotificationFilledOffToggle: {
    use: 'NotificationOffToggle',
    props: { filled: true },
  },
  NotificationFilledOffToggled: {
    use: 'NotificationOffToggle',
    props: { filled: true },
  },
  SendAltFilledOffToggle: { use: 'SendAltOffToggle', props: { filled: true } },
  VideoFilledOffToggle: { use: 'VideoOffToggle', props: { filled: true } },
  VolumeLevelFilledToggle: {
    use: 'VolumeLevelToggle',
    props: { filled: true },
  },
  PlayPauseFilledToggle: { use: 'PlayPauseToggle', props: { filled: true } },
  RecordStopFilledToggle: { use: 'RecordStopToggle', props: { filled: true } },
  // Checkbox: filled by default (as Carbon's Checkbox); the outline twins are `filled={false}`.
  CheckboxOutlineToggle: { use: 'CheckboxToggle', props: { filled: false } },
  CheckboxOutlineStateToggle: {
    use: 'CheckboxStateToggle',
    props: { filled: false },
  },
  // Other drawings and motions: `variant`.
  PlayPauseOutlineToggle: {
    use: 'PlayPauseToggle',
    props: { variant: 'outline' },
  },
  PlayPauseOutlineFilledToggle: {
    use: 'PlayPauseToggle',
    props: { variant: 'outline', filled: true },
  },
  RecordStopFilledAltToggle: {
    use: 'RecordStopToggle',
    props: { variant: 'alt' },
  },
  NotificationRingToggle: {
    use: 'NotificationToggle',
    props: { variant: 'ring' },
  },
} as const satisfies Record<
  string,
  { use: string; props?: Record<string, unknown> }
>;

const P = TOGGLE_ALIASES;

/** @deprecated Use `ChevronDownToggle`. */
export const ChevronDownUpToggleSpec = ChevronDownToggleSpec;
/** @deprecated Use `ChevronLeftToggle`. */
export const ChevronLeftRightToggleSpec = ChevronLeftToggleSpec;
/** @deprecated Use `CaretDownToggle`. */
export const CaretDownUpToggleSpec = CaretDownToggleSpec;
/** @deprecated Use `CaretLeftToggle`. */
export const CaretLeftRightToggleSpec = CaretLeftToggleSpec;
/** @deprecated Use `ChevronUpOutlineToggle`. */
export const ChevronUpDownOutlineToggleSpec = ChevronUpOutlineToggleSpec;
/** @deprecated Use `RowExpandToggle`. */
export const RowExpandCollapseToggleSpec = RowExpandToggleSpec;
/** @deprecated Use `SidePanelOpenToggle`. */
export const SidePanelToggleSpec = SidePanelOpenToggleSpec;
/** @deprecated Use `RightPanelOpenToggle`. */
export const RightPanelToggleSpec = RightPanelOpenToggleSpec;
/** @deprecated Use `BottomPanelOpenToggle`. */
export const BottomPanelToggleSpec = BottomPanelOpenToggleSpec;
/** @deprecated Use `ListToggle`. */
export const ListGridToggleSpec = ListToggleSpec;
/** @deprecated Use `LinkToggle`. */
export const LinkUnlinkToggleSpec = LinkToggleSpec;
/** @deprecated Use `ScanAltOffToggle`. */
export const ScanToggleSpec = ScanAltOffToggleSpec;
/** @deprecated Use `AddToggle`. */
export const AddFilledToggleSpec = AddToggleSpec;
/** @deprecated Use `SubtractToggle`. */
export const SubtractFilledToggleSpec = SubtractToggleSpec;
/** @deprecated Use `CloseToggle`. */
export const CloseFilledToggleSpec = CloseToggleSpec;
/** @deprecated Use `CheckmarkToggle`. */
export const CheckmarkFilledToggleSpec = CheckmarkToggleSpec;
/** @deprecated Use `SendToggle`. */
export const SendToggledSpec = SendToggleSpec;
/** @deprecated Use `SendAltToggle`. */
export const SendAltToggledSpec = SendAltToggleSpec;

/** @deprecated Use `SidePanelOpenToggle` with `filled`. */
export const SidePanelFilledToggleSpec = /* @__PURE__ */ aliasOf(
  'SidePanelFilledToggle',
  SidePanelOpenToggleSpec,
  P.SidePanelFilledToggle.props
);
/** @deprecated Use `RightPanelOpenToggle` with `filled`. */
export const RightPanelFilledToggleSpec = /* @__PURE__ */ aliasOf(
  'RightPanelFilledToggle',
  RightPanelOpenToggleSpec,
  P.RightPanelFilledToggle.props
);
/** @deprecated Use `BottomPanelOpenToggle` with `filled`. */
export const BottomPanelFilledToggleSpec = /* @__PURE__ */ aliasOf(
  'BottomPanelFilledToggle',
  BottomPanelOpenToggleSpec,
  P.BottomPanelFilledToggle.props
);
/** @deprecated Use `FlashOffToggle` with `filled`. */
export const FlashOffFilledToggleSpec = /* @__PURE__ */ aliasOf(
  'FlashOffFilledToggle',
  FlashOffToggleSpec,
  P.FlashOffFilledToggle.props
);
/** @deprecated Use `MicrophoneOffToggle` with `filled`. */
export const MicrophoneOffFilledToggleSpec = /* @__PURE__ */ aliasOf(
  'MicrophoneOffFilledToggle',
  MicrophoneOffToggleSpec,
  P.MicrophoneOffFilledToggle.props
);
/** @deprecated Use `ViewOffToggle` with `filled`. */
export const ViewOffFilledToggleSpec = /* @__PURE__ */ aliasOf(
  'ViewOffFilledToggle',
  ViewOffToggleSpec,
  P.ViewOffFilledToggle.props
);
/** @deprecated Use `NotificationOffToggle` with `filled`. */
export const NotificationFilledOffToggleSpec = /* @__PURE__ */ aliasOf(
  'NotificationFilledOffToggle',
  NotificationOffToggleSpec,
  P.NotificationFilledOffToggle.props
);
/** @deprecated Use `NotificationOffToggle` with `filled`. */
export const NotificationFilledOffToggledSpec = NotificationFilledOffToggleSpec;
/** @deprecated Use `SendAltOffToggle` with `filled`. */
export const SendAltFilledOffToggleSpec = /* @__PURE__ */ aliasOf(
  'SendAltFilledOffToggle',
  SendAltOffToggleSpec,
  P.SendAltFilledOffToggle.props
);
/** @deprecated Use `VideoOffToggle` with `filled`. */
export const VideoFilledOffToggleSpec = /* @__PURE__ */ aliasOf(
  'VideoFilledOffToggle',
  VideoOffToggleSpec,
  P.VideoFilledOffToggle.props
);
/** @deprecated Use `VolumeLevelToggle` with `filled`. */
export const VolumeLevelFilledToggleSpec = /* @__PURE__ */ aliasOf(
  'VolumeLevelFilledToggle',
  VolumeLevelToggleSpec,
  P.VolumeLevelFilledToggle.props
);
/** @deprecated Use `PlayPauseToggle` with `filled`. */
export const PlayPauseFilledToggleSpec = /* @__PURE__ */ aliasOf(
  'PlayPauseFilledToggle',
  PlayPauseToggleSpec,
  P.PlayPauseFilledToggle.props
);
/** @deprecated Use `RecordStopToggle` with `filled`. */
export const RecordStopFilledToggleSpec = /* @__PURE__ */ aliasOf(
  'RecordStopFilledToggle',
  RecordStopToggleSpec,
  P.RecordStopFilledToggle.props
);
/** @deprecated Use `CheckboxToggle` with `filled={false}`. */
export const CheckboxOutlineToggleSpec = /* @__PURE__ */ aliasOf(
  'CheckboxOutlineToggle',
  CheckboxToggleSpec,
  P.CheckboxOutlineToggle.props
);
/** @deprecated Use `CheckboxStateToggle` with `filled={false}`. */
export const CheckboxOutlineStateToggleSpec = /* @__PURE__ */ aliasOf(
  'CheckboxOutlineStateToggle',
  CheckboxStateToggleSpec,
  P.CheckboxOutlineStateToggle.props
);
/** @deprecated Use `PlayPauseToggle` with `variant="outline"`. */
export const PlayPauseOutlineToggleSpec = /* @__PURE__ */ aliasOf(
  'PlayPauseOutlineToggle',
  PlayPauseToggleSpec,
  P.PlayPauseOutlineToggle.props
);
/** @deprecated Use `PlayPauseToggle` with `variant="outline"` and `filled`. */
export const PlayPauseOutlineFilledToggleSpec = /* @__PURE__ */ aliasOf(
  'PlayPauseOutlineFilledToggle',
  PlayPauseToggleSpec,
  P.PlayPauseOutlineFilledToggle.props
);
/** @deprecated Use `RecordStopToggle` with `variant="alt"`. */
export const RecordStopFilledAltToggleSpec = /* @__PURE__ */ aliasOf(
  'RecordStopFilledAltToggle',
  RecordStopToggleSpec,
  P.RecordStopFilledAltToggle.props
);
/** @deprecated Use `NotificationToggle` with `variant="ring"`. */
export const NotificationRingToggleSpec = /* @__PURE__ */ aliasOf(
  'NotificationRingToggle',
  NotificationToggleSpec,
  P.NotificationRingToggle.props
);
