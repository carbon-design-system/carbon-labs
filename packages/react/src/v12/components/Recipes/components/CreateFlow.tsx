/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import { useState, type ReactNode, type RefObject } from 'react';
import {
  StepFlowBody,
  StepFlowProgress,
  stepFlowActions,
  useStepFlow,
  type UseStepFlowOptions,
} from '@carbon-labs/react-step-flow';
import { Tearsheet } from '@carbon-labs/react-tearsheet';

/* ============================================================================
 * CreateFlow: the create-flow recipe. A
 * tearsheet holding a StepFlow: the steps in its influencer, the current
 * step in its main area, Cancel, Back and Next (Submit last) in its footer.
 * Each open starts on the first step; the fields' values are the caller's.
 * ========================================================================== */

export interface CreateFlowProps extends Omit<
  UseStepFlowOptions,
  'initialIndex'
> {
  open: boolean;
  /** Cancel, the close button and Escape. */
  onClose?: () => void;
  title: ReactNode;
  /** A label over the title (the kind of item). */
  label?: ReactNode;
  description?: ReactNode;
  launcherButtonRef?: RefObject<HTMLElement | null>;
  timeScale?: number;
  className?: string;
}

export function CreateFlow({
  open,
  onClose,
  title,
  label,
  description,
  launcherButtonRef,
  timeScale,
  className,
  ...options
}: CreateFlowProps) {
  const flow = useStepFlow(options);
  // A new open starts over, in the render that opens it: the first step, nothing tried.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) flow.reset();
  }
  return (
    <Tearsheet
      open={open}
      onClose={() => onClose?.()}
      title={title}
      label={label}
      description={description}
      launcherButtonRef={launcherButtonRef}
      timeScale={timeScale}
      className={['cds-create-flow', className].filter(Boolean).join(' ')}
      influencer={<StepFlowProgress flow={flow} vertical />}
      actions={stepFlowActions(flow, { onCancel: () => onClose?.() })}>
      <StepFlowBody flow={flow} timeScale={timeScale} />
    </Tearsheet>
  );
}
