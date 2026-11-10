/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { describe, expect, it } from 'vitest';
import type { Job, JobStatus } from '../components/JobsTray';
import { jobsStatus, jobsStatusLabel } from '../components/JobsTrayIndicator';

const jobs = (...statuses: JobStatus[]): Job[] =>
  statuses.map((status, i) => ({ id: String(i), title: String(i), status }));

describe('jobsStatus', () => {
  it('is pending while any job is queued or running, whatever else has ended', () => {
    expect(jobsStatus(jobs('running'))).toBe('pending');
    expect(jobsStatus(jobs('queued'))).toBe('pending');
    expect(jobsStatus(jobs('failed', 'finished', 'running'))).toBe('pending');
  });
  it('is error once none is at work and any failed, else success if any finished', () => {
    expect(jobsStatus(jobs('finished', 'failed'))).toBe('error');
    expect(jobsStatus(jobs('finished', 'cancelled'))).toBe('success');
  });
  it('reads status, not progress: a job at work with or without progress, queued ones too', () => {
    const mixed: Job[] = [
      { id: 'a', title: 'a', status: 'running', progress: 40 },
      { id: 'b', title: 'b', status: 'queued' },
      { id: 'c', title: 'c', status: 'finished', progress: 100 },
    ];
    expect(jobsStatus(mixed)).toBe('pending');
    expect(jobsStatus([{ id: 'a', title: 'a', status: 'running' }])).toBe(
      'pending'
    );
    expect(jobsStatus(mixed.slice(2))).toBe('success');
  });
  it('is none with no jobs, or only cancelled ones', () => {
    expect(jobsStatus([])).toBeUndefined();
    expect(jobsStatus(jobs('cancelled'))).toBeUndefined();
  });
});

describe('jobsStatusLabel', () => {
  it("takes the tray's words by default", () => {
    expect(jobsStatusLabel('pending')).toBe('In progress');
    expect(jobsStatusLabel('success')).toBe('Done');
    expect(jobsStatusLabel('error')).toBe('Failed');
  });
  it('takes the given words for its job status, the rest by default', () => {
    const words = { running: 'En cours', failed: 'Échec' };
    expect(jobsStatusLabel('pending', words)).toBe('En cours');
    expect(jobsStatusLabel('error', words)).toBe('Échec');
    expect(jobsStatusLabel('success', words)).toBe('Done');
  });
});
