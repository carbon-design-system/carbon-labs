/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import { countSteps, summarizeSteps, type Step } from '../components/StepList';
import { formatDuration } from '../components/TurnStatus';
import {
  createTurnsStore,
  firstLine,
  stepTurn,
  turnInView,
} from '../components/turns';

const step = (
  id: string,
  status: Step['status'],
  extra: Partial<Step> = {}
): Step => ({ id, label: id, status, ...extra });

describe('the chat parts’ words', () => {
  it('counts the steps that happened, not the queued ones', () => {
    const steps = [
      step('a', 'done', { tool: true }),
      step('b', 'error'),
      step('c', 'cancelled'),
      step('d', 'queued'),
    ];
    expect(countSteps(steps)).toBe('3 steps · 1 tool · 1 failed · 1 cancelled');
    expect(countSteps([step('a', 'running')])).toBe('1 step');
  });

  it('summarizes a finished list with its real time, divided by the time scale', () => {
    const steps = [
      step('a', 'done', { startedAt: 100, endedAt: 1100 }),
      step('b', 'done', { startedAt: 1100, endedAt: 9300 }),
    ];
    expect(summarizeSteps(steps)).toBe('2 steps · 9.2s');
    expect(summarizeSteps(steps, 2)).toBe('2 steps · 4.6s');
  });

  it('takes a host’s own count words', () => {
    const steps = [step('a', 'done', { startedAt: 0, endedAt: 1000 })];
    expect(summarizeSteps(steps, 1, (s) => `${s.length} étape`)).toBe(
      '1 étape · 1.0s'
    );
  });

  it('formats a duration: a decimal under 10s, whole seconds under a minute, then minutes', () => {
    expect(formatDuration(4200)).toBe('4.2s');
    expect(formatDuration(42_900)).toBe('42s');
    expect(formatDuration(72_000)).toBe('1m 12s');
  });
});

describe('the turn navigator', () => {
  // Questions at these content tops, px; the pad is 16.
  const tops = [16, 400, 900, 1500];

  it('reads the turn in view: the last question at or above the view’s top, or the last in view at the end', () => {
    expect(turnInView(tops, 0, 600, false)).toBe(0);
    expect(turnInView(tops, 384, 600, false)).toBe(1);
    expect(turnInView(tops, 700, 600, false)).toBe(1);
    expect(turnInView(tops, 1000, 600, true)).toBe(3);
    expect(turnInView([], 0, 600, false)).toBe(-1);
  });

  it('steps to the question above or below the view’s top', () => {
    expect(stepTurn(tops, 384, 1)).toBe(2);
    expect(stepTurn(tops, 384, -1)).toBe(0);
    expect(stepTurn(tops, 700, -1)).toBe(1);
    expect(stepTurn(tops, 0, -1)).toBe(-1);
    expect(stepTurn(tops, 1484, 1)).toBe(-1);
  });

  it('lists a question by its first line', () => {
    expect(firstLine('  Draft a note.\nKeep it short.')).toBe('Draft a note.');
  });

  it('tells its readers only of a change', () => {
    const store = createTurnsStore();
    let calls = 0;
    store.subscribe(() => calls++);
    const questions = [{ id: 'u1', text: 'Hi' }];
    store.set({ questions, timeScale: 1 });
    store.set({ questions, timeScale: 1 });
    expect(calls).toBe(1);
    expect(store.get().questions).toBe(questions);
  });
});
