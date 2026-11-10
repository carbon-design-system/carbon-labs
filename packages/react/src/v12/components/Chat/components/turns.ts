/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createContext, useContext } from 'react';

// The transcript publishes its questions and viewport; the shell's turn navigator reads them.
// A store, so a streaming reply re-renders neither the shell nor the navigator.

/** A question: a user turn's id, its first line and its send time. */
export interface ChatQuestion {
  id: string;
  text: string;
  time?: number;
}

export interface ChatTurnsState {
  /** The transcript's scroll viewport. */
  viewport: HTMLElement | null;
  questions: ChatQuestion[];
  reduced: boolean;
  timeScale: number;
}

export interface ChatTurnsStore {
  get(): ChatTurnsState;
  set(next: Partial<ChatTurnsState>): void;
  subscribe(listener: () => void): () => void;
}

export function createTurnsStore(): ChatTurnsStore {
  let state: ChatTurnsState = {
    viewport: null,
    questions: [],
    reduced: false,
    timeScale: 1,
  };
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(next) {
      if (
        (Object.keys(next) as (keyof ChatTurnsState)[]).every(
          (k) => state[k] === next[k]
        )
      ) {
        return;
      }
      state = { ...state, ...next };
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const ChatTurnsContext = createContext<ChatTurnsStore | null>(null);
export const useChatTurns = () => useContext(ChatTurnsContext);

/** A question's first line, its words as the list shows them. */
export const firstLine = (text: string) => text.trim().split('\n')[0]!.trim();

/** A question's element in the transcript. */
export const questionElement = (viewport: HTMLElement | null, id: string) =>
  viewport?.querySelector<HTMLElement>(`[data-turn="${CSS.escape(id)}"]`) ??
  null;

/** How far into the view a question's top may sit and still count as at the top, px: the jump's landing pad. */
export const TURN_PAD = 16;

/** The turn in view, by its question's index: the last question at or above the view's top
 *  (plus the pad); at the end, the last one in view. `tops` are content px, in order. */
export function turnInView(
  tops: number[],
  scrollTop: number,
  view: number,
  atEnd: boolean
): number {
  if (!tops.length) {
    return -1;
  }
  const line = atEnd ? scrollTop + view - 1 : scrollTop + TURN_PAD + 1;
  let i = 0;
  tops.forEach((t, k) => {
    if (t <= line) {
      i = k;
    }
  });
  return i;
}

/** The question a step lands on: the nearest whose top is above (`-1`) or below (`1`) the view's top. */
export function stepTurn(
  tops: number[],
  scrollTop: number,
  dir: 1 | -1
): number {
  const line = scrollTop + TURN_PAD;
  if (dir < 0) {
    for (let k = tops.length - 1; k >= 0; k--) {
      if (tops[k]! < line - 1) {
        return k;
      }
    }
    return -1;
  }
  return tops.findIndex((t) => t > line + 1);
}
