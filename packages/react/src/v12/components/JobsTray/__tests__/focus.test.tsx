/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @vitest-environment jsdom
/** @jsxRuntime automatic */

import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import '../../../vitest.setup';
import { setReducedMotion } from '../../../vitest.dom';
import { JobsTray, type Job } from '../components/JobsTray';

setReducedMotion(true);

// jsdom has no document timeline: a running job's spinner reads its time.
beforeAll(() => {
  if (!('timeline' in document))
    Object.defineProperty(document, 'timeline', {
      configurable: true,
      value: { currentTime: 0 },
    });
});

const JOBS: Job[] = [
  { id: 'a', title: 'Upload report.pdf', status: 'running', progress: 40 },
  { id: 'b', title: 'Export table', status: 'finished' },
];

/** A tray whose caller cancels and clears as asked. */
function Tray() {
  const [jobs, setJobs] = useState(JOBS);
  return (
    <JobsTray
      open
      jobs={jobs}
      toast={false}
      onCancel={(job) =>
        setJobs((all) =>
          all.map((j) => (j.id === job.id ? { ...j, status: 'cancelled' } : j))
        )
      }
      onClearFinished={() =>
        setJobs((all) => all.filter((j) => j.status === 'running'))
      }
    />
  );
}

const tray = () => screen.getByRole('dialog', { name: 'Background jobs' });

describe('JobsTray focus', () => {
  it("goes to the tray when a job's Cancel goes with the press", () => {
    render(<Tray />);
    const cancel = screen.getByRole('button', {
      name: 'Cancel Upload report.pdf',
    });
    cancel.focus();
    fireEvent.click(cancel);
    expect(
      screen.queryByRole('button', { name: 'Cancel Upload report.pdf' })
    ).toBeNull();
    expect(document.activeElement).toBe(tray());
  });

  it('goes to the tray when Clear finished goes with the press', () => {
    render(<Tray />);
    const clear = screen.getByRole('button', { name: 'Clear finished' });
    clear.focus();
    fireEvent.click(clear);
    expect(document.activeElement).toBe(tray());
  });
});
