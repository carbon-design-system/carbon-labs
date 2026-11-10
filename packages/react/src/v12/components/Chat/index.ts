/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The chat parts, a reply's status and its steps.
export { ChatShell } from './components/ChatShell';
export type { ChatShellProps } from './components/ChatShell';
export { useChatVariant } from './components/context';
export type { ChatCorners, ChatVariant } from './components/context';
export { ChatDock } from './components/ChatDock';
export type { ChatDockProps } from './components/ChatDock';
export { ChatPane } from './components/ChatPane';
export type { ChatPaneProps } from './components/ChatPane';
export { ChatTranscript } from './components/ChatTranscript';
export type {
  ChatStep,
  ChatTranscriptProps,
  ChatTurn,
  ChatTurnStatus,
} from './components/ChatTranscript';
export { ChatTurnNavigator } from './components/ChatTurnNavigator';
export type {
  ChatTurnNavigatorProps,
  ChatTurnNavigatorWords,
} from './components/ChatTurnNavigator';
export { ChatActions, ChatMessage } from './components/ChatMessage';
export type {
  ChatActionsWords,
  ChatActionsProps,
  ChatMessageProps,
  ChatRating,
  ChatRole,
} from './components/ChatMessage';
export { PromptInput } from './components/PromptInput';
export type {
  PromptInputWords,
  PromptInputProps,
} from './components/PromptInput';
export type { PromptNoticeValue } from './components/PromptNotice';
export { FileChips } from './components/FileChips';
export type {
  ChipFile,
  FileChipsWords,
  FileChipsProps,
} from './components/FileChips';
export { Suggestions } from './components/Suggestions';
export type { Suggestion, SuggestionsProps } from './components/Suggestions';
export { FollowUpCard } from './components/FollowUpCard';
export type { FollowUpCardProps } from './components/FollowUpCard';
export { TurnStatus, useTurnRelease } from './components/TurnStatus';
export type { TurnStatusProps, TurnStatusValue } from './components/TurnStatus';
export { StepList, STEP_LIST_MOTION, countSteps } from './components/StepList';
export type {
  Step,
  StepListWords,
  StepListProps,
  StepStatus,
} from './components/StepList';
