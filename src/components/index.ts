/**
 * Copyright IBM Corp. 2025
 *
 * Carbon Motion Workshop — component barrel export.
 * Import from here to get all components in one import.
 */

export { SkeletonLayout, SkeletonBlock } from './SkeletonLayout/SkeletonLayout';
export type {
  SkeletonLayoutProps,
  SkeletonLayoutVariant,
  SkeletonBlockProps,
  SkeletonBlockVariant,
} from './SkeletonLayout/SkeletonLayout.types';
export { useSkeletonAnimation } from '../hooks/useSkeletonAnimation';

export { Processing }            from './Processing/Processing';
export type { ProcessingProps, ProcessingMode, ProcessingHandle } from './Processing/Processing';

export { ContentSwitcher }       from './ContentSwitcher/ContentSwitcher';
export type { ContentSwitcherProps, ContentSwitcherOption, ContentSwitcherSize } from './ContentSwitcher/ContentSwitcher.types';

export { LoadingSpinner }        from './LoadingSpinner/LoadingSpinner';
export type { LoadingSpinnerProps, LoadingSpinnerSize } from './LoadingSpinner/LoadingSpinner';

export { IndeterminateBarLoader } from './IndeterminateBarLoader/IndeterminateBarLoader';
export type { IndeterminateBarLoaderProps } from './IndeterminateBarLoader/IndeterminateBarLoader';

export { UniversalPromptBar }    from './UniversalPromptBar/UniversalPromptBar';
export type { UniversalPromptBarProps } from './UniversalPromptBar/UniversalPromptBar';

export { MotionAvatar }          from './MotionAvatar/MotionAvatar';
export type { MotionAvatarProps, MotionAvatarState, MotionAvatarSize } from './MotionAvatar/MotionAvatar';
