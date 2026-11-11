/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** @jsxRuntime automatic */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { TableOfContents } from '@carbon-labs/react-motion-icons';
import { DURATION_FLOOR_MS, motionTokens } from '@carbon-labs/v12-motion';
import {
  relativeTimeText,
  useMinuteClock,
} from '@carbon-labs/react-activity-feed';
import { attachJumpTo, type JumpEngine } from '@carbon-labs/react-jump-to';
import { Popover } from '@carbon-labs/react-popover';
import { Scroller } from '@carbon-labs/react-scroller';
import { SelectItem, SelectList } from '@carbon-labs/react-select-list';
import { IconButton } from '@carbon-labs/react-tooltip';
import { useChatVariant } from './context';
import {
  questionElement,
  stepTurn,
  turnInView,
  useChatTurns,
  type ChatQuestion,
  type ChatTurnsState,
} from './turns';
import './chat-surface.scss';

/* ============================================================================
 * ChatTurnNavigator: the conversation's questions from the chat header.
 *
 *   open     a header button opens the kit Popover, the floating snap from the button
 *   list     a select list of each question's first line and its relative time;
 *            its marker sits on the turn in view and moves in place, never gliding
 *   jump     a choice closes it, then JumpTo's glide brings the question to the
 *            top and focuses it; a quiet surface fades on it as it lands
 *   keys     Alt+↑ and Alt+↓ step between questions from the transcript or a
 *            question, never from a control
 *   rest     one icon button; no scroll work while closed
 *   reduced  the jump lands at once, with no highlight
 * ========================================================================== */

export interface ChatTurnNavigatorProps {
  /** The button's, the panel's and the list's name. Default "Questions". */
  label?: string;
  /** A question's time as words, from its time and the clock's minute (ms). Default: "Just now", "5 min ago", "2 h ago", or the clock time on an earlier day. */
  formatTime?: (time: number, now: number) => string;
  /** Alt+↑ and Alt+↓ step to the previous and next question. Default true. */
  shortcuts?: boolean;
  className?: string;
}

/** The words a host passes on to the navigator (the Assistant's `navigatorProps`). */
export type ChatTurnNavigatorWords = Pick<
  ChatTurnNavigatorProps,
  'label' | 'formatTime'
>;

const EMPTY: ChatTurnsState = {
  viewport: null,
  questions: [],
  reduced: false,
  timeScale: 1,
};
const noop = () => () => {};

/** Each question's top in the viewport's content, px. */
function questionTops(
  viewport: HTMLElement,
  questions: ChatQuestion[]
): number[] {
  const top = viewport.getBoundingClientRect().top - viewport.scrollTop;
  return questions.map(
    (q) =>
      (questionElement(viewport, q.id)?.getBoundingClientRect().top ?? 0) - top
  );
}

/** Whether a key on `t` is the transcript's: the viewport, a question, or inside the transcript outside every control. */
function fromTranscript(
  t: HTMLElement,
  vp: HTMLElement,
  qs: ChatQuestion[]
): boolean {
  if (t === vp || qs.some((q) => questionElement(vp, q.id) === t)) return true;
  if (!vp.contains(t)) return false;
  for (let el: HTMLElement | null = t; el && el !== vp; el = el.parentElement)
    if (
      el.tabIndex >= 0 ||
      el.hasAttribute('role') ||
      el.isContentEditable ||
      el.matches('button, a[href], input, select, textarea, summary')
    )
      return false;
  return true;
}

const atEndOf = (vp: HTMLElement) =>
  vp.scrollTop >= vp.scrollHeight - vp.clientHeight - 2;
const inViewOf = (vp: HTMLElement, qs: ChatQuestion[]) =>
  turnInView(questionTops(vp, qs), vp.scrollTop, vp.clientHeight, atEndOf(vp));

/** Each question's latest wash: only its end clears the mark. */
const washes = new WeakMap<HTMLElement, Animation>();

/** The highlight: a quiet surface fades up on the question as it lands, then out. */
function highlight(el: HTMLElement, timeScale: number) {
  const inMs = motionTokens.duration['fast-02'];
  const outMs = motionTokens.duration['slow-01'];
  el.dataset.highlight = '';
  const a = el.animate(
    [
      { opacity: 0 },
      { opacity: 1, offset: inMs / (inMs + outMs) },
      { opacity: 0 },
    ],
    {
      duration: Math.max(DURATION_FLOOR_MS, (inMs + outMs) * timeScale),
      easing: 'linear',
      pseudoElement: '::before',
    }
  );
  washes.get(el)?.cancel();
  washes.set(el, a);
  const done = () => {
    if (washes.get(el) !== a) return;
    washes.delete(el);
    delete el.dataset.highlight;
  };
  a.finished.then(done, done);
}

export function ChatTurnNavigator({
  label = 'Questions',
  formatTime,
  shortcuts = true,
  className,
}: ChatTurnNavigatorProps) {
  const store = useChatTurns();
  const state = useSyncExternalStore(
    store?.subscribe ?? noop,
    store?.get ?? (() => EMPTY),
    store?.get ?? (() => EMPTY)
  );
  const { viewport, questions, timeScale } = state;
  const variant = useChatVariant();
  const [open, setOpen] = useState(false);
  const [button, setButton] = useState<HTMLElement | null>(null);
  // The turn in view, read as it opens and while it is open.
  const [current, setCurrent] = useState(-1);
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  });

  // The jump: JumpTo's engine on the viewport, made on the first jump.
  const engine = useRef<{ box: HTMLElement; e: JumpEngine } | null>(null);
  useEffect(
    () => () => {
      engine.current?.e.destroy();
      engine.current = null;
    },
    [viewport]
  );
  const jumpTo = useCallback((index: number) => {
    const {
      viewport: vp,
      questions: qs,
      reduced: r,
      timeScale: ts,
    } = latest.current;
    const q = qs[index];
    const el = vp && q ? questionElement(vp, q.id) : null;
    if (!vp || !el) return;
    if (engine.current?.box !== vp) {
      engine.current?.e.destroy();
      engine.current = {
        box: vp,
        e: attachJumpTo(vp, () => ({
          threshold: 0,
          stick: false,
          block: 'start',
          reduced: latest.current.reduced,
          timeScale: latest.current.timeScale,
          onChange: () => {},
        })),
      };
    }
    const e = engine.current.e;
    e.setTarget(el);
    // Focus moves to the question as the glide starts; the surface marks it once it lands.
    void e.jump({ keyboard: true }).then((landed) => {
      if (landed && !r) highlight(el, ts);
    });
  }, []);

  // The marker follows the turn in view while the list is open: read per frame of a scroll, nothing at rest.
  useEffect(() => {
    if (!open || !viewport) return;
    const read = () => setCurrent(inViewOf(viewport, latest.current.questions));
    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          read();
        });
    };
    viewport.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      viewport.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [open, viewport, questions]);

  // Alt+↑ / Alt+↓ from the transcript only: from the focused question, else from the view's top.
  useEffect(() => {
    const shell = button?.closest<HTMLElement>('.cds-chat-shell');
    if (!shortcuts || !shell) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        !e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')
      )
        return;
      const t = e.target as HTMLElement;
      const { viewport: vp, questions: qs } = latest.current;
      if (!vp || !qs.length || !fromTranscript(t, vp, qs)) return;
      const dir = e.key === 'ArrowUp' ? -1 : 1;
      const focused = qs.findIndex((q) => questionElement(vp, q.id) === t);
      const next =
        focused >= 0
          ? focused + dir
          : stepTurn(questionTops(vp, qs), vp.scrollTop, dir);
      if (next < 0 || next >= qs.length) return;
      e.preventDefault();
      jumpTo(next);
    };
    shell.addEventListener('keydown', onKey);
    return () => shell.removeEventListener('keydown', onKey);
  }, [button, shortcuts, jumpTo]);

  // One jump per pick: a row's click and the list's change can both report it.
  const picked = useRef(false);
  const choose = (index: number) => {
    if (!open || picked.current) return;
    picked.current = true;
    setOpen(false);
    // After the pick's own handling, which focuses its row.
    requestAnimationFrame(() => jumpTo(index));
  };

  return (
    <>
      <IconButton
        ref={setButton as never}
        label={label}
        frame="ghost"
        size="sm"
        align="bottom"
        disabled={questions.length === 0}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={['cds-chat-turns__button', className]
          .filter(Boolean)
          .join(' ')}
        onClick={() => {
          // The list opens on the turn in view, its marker already there.
          if (!open && viewport) setCurrent(inViewOf(viewport, questions));
          picked.current = false;
          setOpen(!open);
        }}>
        <TableOfContents size={16} />
      </IconButton>
      <Popover
        open={open}
        onRequestClose={() => setOpen(false)}
        anchor={button}
        label={label}
        align="bottom-end"
        timeScale={timeScale}>
        <QuestionList
          questions={questions}
          current={current}
          label={label}
          variant={variant}
          formatTime={formatTime}
          onChoose={choose}
        />
      </Popover>
    </>
  );
}
ChatTurnNavigator.displayName = 'ChatTurnNavigator';

function QuestionList({
  questions,
  current,
  label,
  variant,
  formatTime,
  onChoose,
}: {
  questions: ChatQuestion[];
  current: number;
  label: string;
  variant: ReturnType<typeof useChatVariant>;
  formatTime?: (time: number, now: number) => string;
  onChoose: (index: number) => void;
}) {
  const now = useMinuteClock();
  const vpRef = useRef<HTMLDivElement>(null);
  const value = questions[current]?.id ?? null;
  const index = (id: unknown) => questions.findIndex((q) => q.id === id);

  // As it opens, the turn in view's row: in view in the list, and focused once the popover has placed focus.
  useEffect(() => {
    const vp = vpRef.current;
    const row = vp?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!vp || !row) return;
    vp.scrollTop = Math.max(
      0,
      row.offsetTop - (vp.clientHeight - row.offsetHeight) / 2
    );
    const raf = requestAnimationFrame(() => {
      if (vp.contains(document.activeElement))
        row.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Scroller className="cds-chat-turns" viewportRef={vpRef} focusable={false}>
      <div
        // A pick of the turn already marked has no change: the click still jumps.
        onClick={(e) => {
          const row = (e.target as Element).closest<HTMLElement>(
            '[role="option"]'
          );
          if (row) onChoose(Number(row.dataset.index));
        }}>
        <SelectList
          label={label}
          value={value}
          onChange={({ value: v }) => onChoose(index(v))}
          activation="manual"
          frame="ghost"
          fit="fill"
          size="md"
          variant={variant}
          // The marker marks where the reader is: it moves in place.
          reduced
          className="cds-chat-turns__list">
          {questions.map((q) => (
            <SelectItem
              key={q.id}
              value={q.id}
              text={q.text}
              secondaryLabel={
                q.time != null
                  ? (formatTime ?? relativeTimeText)(q.time, now)
                  : undefined
              }>
              <span className="cds-chat-turns__text">{q.text}</span>
            </SelectItem>
          ))}
        </SelectList>
      </div>
    </Scroller>
  );
}
