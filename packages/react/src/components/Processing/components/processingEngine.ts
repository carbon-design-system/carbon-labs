/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Processing engine — the framework-agnostic choreography behind <Processing>.
 *
 * It drives four SVG circles inside one <g> with the Web Animations API and
 * owns every timing decision; a view layer (the React component, or a web
 * component) only renders the markup and forwards calls.
 *
 *   - Every animation is anchored to the document timeline via startTime, so
 *     staggers can't drift when a tab is throttled.
 *   - Idle costs nothing: each dot's pulse is one infinite animation and the
 *     spin is one infinite animation — no JS runs between transitions.
 *   - Transitions run one at a time. A request made mid-transition is queued
 *     (the latest wins) and runs when the current one lands, so every
 *     transition starts from a settled shape. Triangle ↔ square goes through
 *     the loading line (unwind, then form); from nothing it loads in first.
 *   - Line roles (left / centre / right / spare) map onto the four elements.
 *     An unwind hands them to whichever dots are best placed, so it is the
 *     same gesture wherever the spin was.
 *   - Settled positions are written back to attributes and finished move
 *     animations cancelled, so nothing piles up between transitions.
 *
 * Written as a closure rather than a class so the minifier can shorten every
 * internal name.
 */

export type ProcessingMode = 'loading' | 'triangle' | 'square' | 'out';

/** Every method resolves true once its state is reached, false if superseded. */
export interface ProcessingEngine {
  /** Restart from nothing: load in, then go to `mode`. Static paints end states only. */
  run(
    mode: ProcessingMode,
    loop: boolean,
    staticOnly: boolean
  ): Promise<boolean>;
  /**
   * Go to `mode` from wherever the dots are. Restarts instead when nothing is
   * showing (before the first run, after out) or `loop` / `staticOnly` changed.
   */
  setMode(
    mode: ProcessingMode,
    loop: boolean,
    staticOnly: boolean
  ): Promise<boolean>;
  toLoading(): Promise<boolean>;
  toTriangle(): Promise<boolean>;
  toSquare(): Promise<boolean>;
  wiggle(): Promise<boolean>;
  out(): Promise<boolean>;
  destroy(): void;
}

type Shape = 'line' | 'triangle' | 'square';
type Target = Shape | 'wiggle';
type Pt = { x: number; y: number };

// ─── Geometry (32×32 viewBox) ─────────────────────────────────────────────────

const C = 16;
const R_ARC = 7; // formation arc radius
const R_VERTEX = 6; // triangle and square vertices share this circle
const LINE: readonly Pt[] = [
  { x: 8, y: C },
  { x: C, y: C },
  { x: 24, y: C },
];
const SPAWN: Pt = { x: C, y: C }; // a square's fourth dot grows in at the centre
const TRI_DEG = [150, 30, 270]; // vertex angle per role
const SQR_DEG = [135, 45, 315, 225];
const TRI_PULSE = [2, 1, 0]; // triangle pulses clockwise: top → bottom-right → bottom-left

// Where each role lands when a shape unwinds, as polar coordinates. The centre
// dot spirals in, so its angle is free; a square's spare rejoins the right dot.
const UNWIND = [
  { deg: 180, r: 8, pos: LINE[0] },
  { deg: null, r: 0, pos: LINE[1] },
  { deg: 0, r: 8, pos: LINE[2] },
  { deg: 0, r: 8, pos: LINE[2] },
] as const;

// ─── Timing (ms) ──────────────────────────────────────────────────────────────

const STAGGER = 200; // load-in / pulse stagger between dots
const LOAD = 1000;
const LOOP = 1000; // one pulse cycle
const OUT_STAGGER = 50;
const OUT = 100;
const FORM = 700; // each dot's formation move
// Delay before each dot's formation move. The dots funnel through one entry
// point, so these (with SLIDE_SPEED) keep them from bunching; the square's
// fourth dot waits until the centre it grows from is clear.
const FORM_STAGGER_TRI = [0, 50, 80];
const FORM_STAGGER_SQR = [0, 50, 80, 280];
const SLIDE_SPEED = 0.05; // px/ms — a slide's share of FORM grows with its length
const ROT = 8000; // one steady revolution
const SPIN = 360 / ROT; // steady spin speed, deg/ms
const RAMP_LEAD = 200; // the spin reaches full speed this long before landing
const WIGGLE = 400;
const WIGGLE_STAGGER = 200;
const QUICK = FORM * 0.6; // unwinds run 40% faster than formations
const MIN_ARC = 90; // every unwind turns at least this far clockwise
const STEPS = 24; // keyframes per curved path (sub-0.05px chord error)

// ─── Appearance & easing ──────────────────────────────────────────────────────

const R0 = '0px';
const R_REST = '0.875px';
const R_PEAK = '2.5px';
const SW0 = '0';
const SW1 = '1.72';

const EI = 'cubic-bezier(0, 0, 0.3, 1)'; // expressive entrance
const EO = 'cubic-bezier(0.4, 0.14, 1, 1)'; // expressive exit
const EF = 'cubic-bezier(0.4, 0.14, 0.3, 1)'; // expressive standard
// Quadratic ease-in: constant acceleration, ending at twice the average speed —
// so a ramp of SPIN·dur/2 degrees hands off to the steady spin seamlessly.
const RAMP_EASE = 'cubic-bezier(0.333, 0, 0.667, 0.333)';

const LOAD_IN: Keyframe[] = [
  { r: R0, strokeWidth: SW0, easing: EI },
  { r: R_PEAK, strokeWidth: SW1, offset: 0.25, easing: EI },
  { r: R_REST, strokeWidth: SW1, offset: 0.833 },
  { r: R_REST, strokeWidth: SW1 },
];
const PULSE: Keyframe[] = [
  { r: R_REST, easing: EI },
  { r: R_PEAK, offset: 0.25, easing: EI },
  { r: R_REST, offset: 0.917 },
  { r: R_REST },
];

// ─── Math ─────────────────────────────────────────────────────────────────────

/**
 * Degrees to radians.
 * @param {number} deg - angle in degrees
 */
const toRad = (deg: number) => (deg * Math.PI) / 180;
/**
 * Radians to degrees.
 * @param {number} rad - angle in radians
 */
const toDeg = (rad: number) => (rad * 180) / Math.PI;
/**
 * Normalise an angle into [0, 360).
 * @param {number} deg - angle in degrees
 */
const mod360 = (deg: number) => ((deg % 360) + 360) % 360;
/**
 * Point at an angle and radius from the centre.
 * @param {number} deg - angle in degrees, clockwise from +x
 * @param {number} r - radius
 */
const polar = (deg: number, r: number): Pt => ({
  x: C + r * Math.cos(toRad(deg)),
  y: C + r * Math.sin(toRad(deg)),
});
/**
 * Cubic Hermite ease: 0 → 1 with start slope k, end slope 0 (monotonic for k ≤ 3).
 * @param {number} t - progress, 0–1
 * @param {number} k - start slope
 */
const hermite = (t: number, k: number) =>
  k * t + (3 - 2 * k) * t * t + (k - 2) * t * t * t;
/**
 * Ease-in-out with zero velocity at both ends.
 * @param {number} t - progress, 0–1
 */
const smoothstep = (t: number) => t * t * (3 - 2 * t);
/**
 * A cx/cy keyframe.
 * @param {number} offset - keyframe offset, 0–1
 * @param {Pt} p - position
 */
const kf = (offset: number, p: Pt): Keyframe => ({
  offset,
  cx: `${p.x}px`,
  cy: `${p.y}px`,
});

// Formation paths only ever start from line or spawn positions, so each is
// built once and reused.
const formCache = new Map<string, Keyframe[]>();

/**
 * One dot's formation path: a straight slide to the 180° entry point, then a
 * clockwise arc to its vertex, spiralling in from R_ARC to R_VERTEX.
 * @param {Pt} from - start position
 * @param {number} deg - vertex angle
 * @param {boolean} pureArc - skip the slide (dot already at the entry point)
 */
function formationFrames(from: Pt, deg: number, pureArc: boolean): Keyframe[] {
  const key = `${from.x},${from.y},${deg},${pureArc}`;
  let frames = formCache.get(key);
  if (frames) {
    return frames;
  }
  const dist = Math.hypot(from.x - (C - R_ARC), from.y - C);
  const slide =
    pureArc || dist < 0.01 ? 0 : Math.min(0.6, dist / (SLIDE_SPEED * FORM));
  const sweep = mod360(deg - 180) || 360;
  frames = [kf(0, from)];
  for (let i = slide > 0 ? 0 : 1; i <= STEPS; i++) {
    const t = i / STEPS;
    frames.push(
      kf(
        slide + (1 - slide) * t,
        polar(180 + sweep * t, R_ARC + (R_VERTEX - R_ARC) * t)
      )
    );
  }
  formCache.set(key, frames);
  return frames;
}

/**
 * Orbit from `start` by `sweep` degrees, easing the radius to `endR`; lands exactly on `end`.
 * @param {object} start - start position in polar form
 * @param {number} start.deg - start angle
 * @param {number} start.r - start radius
 * @param {number} sweep - degrees to travel, clockwise
 * @param {number} endR - end radius
 * @param {number} k - start slope of the angular ease
 * @param {Pt} end - exact final position
 */
function orbitFrames(
  start: { deg: number; r: number },
  sweep: number,
  endR: number,
  k: number,
  end: Pt
) {
  const frames: Keyframe[] = [];
  for (let i = 0; i < STEPS; i++) {
    const t = i / STEPS;
    frames.push(
      kf(
        t,
        polar(
          start.deg + sweep * hermite(t, k),
          start.r + (endR - start.r) * smoothstep(t)
        )
      )
    );
  }
  frames.push(kf(1, end));
  return frames;
}

/** Whether this environment implements the Web Animations API (jsdom does not). */
export const canAnimate = () =>
  typeof Element !== 'undefined' &&
  typeof Element.prototype.animate === 'function';

// ─── Engine ───────────────────────────────────────────────────────────────────

/**
 * Create the engine for one Processing instance.
 * @param {SVGGElement} group - the rotating group
 * @param {SVGCircleElement[]} dots - the four dot circles
 */
export function createProcessingEngine(
  group: SVGGElement,
  dots: readonly SVGCircleElement[]
): ProcessingEngine {
  let move = 0; // bumped per transition; stale continuations compare against it
  let busy = false;
  let visible = false;
  let staticOnly = false;
  let loopForever = true;
  let shape: Shape = 'line';
  let roles = [0, 1, 2, 3]; // element index for left, centre, right, spare
  let pending: { target: Target; resolve: (landed: boolean) => void } | null =
    null;
  let spinning = false;
  let ramp: { start: number; dur: number } | null = null; // set while spinning up
  let pulseOrigin = 0; // timeline time of slot 0's first pulse — the pulse grid
  const pulses: (Animation | null)[] = [null, null, null, null];
  const slots = [0, 1, 2, 3]; // pulse slot per element

  group.style.transformOrigin = `${C}px ${C}px`;

  /**
   * Does nothing.
   */
  const noop = () => {};
  /**
   * Current document-timeline time in ms.
   */
  const now = () => (document.timeline?.currentTime as number | null) ?? 0;
  /**
   * The first `n` dots in role order.
   * @param {number} n - how many roles
   */
  const inRoles = (n: number) => roles.slice(0, n).map((i) => dots[i]);
  /**
   * Cancel an animation, ignoring one that is already gone.
   * @param {Animation} a - animation to cancel
   */
  const cancel = (a: Animation) => {
    try {
      a.cancel();
    } catch {
      // already gone
    }
  };
  /**
   * Cancel every animation on an element.
   * @param {Element} el - element
   */
  const cancelAll = (el: Element) => el.getAnimations?.().forEach(cancel);
  /**
   * Start an animation anchored to the document timeline.
   * @param {Element} el - element to animate
   * @param {Keyframe[]} frames - keyframes
   * @param {KeyframeAnimationOptions} opts - timing options
   * @param {number} start - timeline start time in ms
   */
  const play = (
    el: Element,
    frames: Keyframe[],
    opts: KeyframeAnimationOptions,
    start: number
  ) => {
    const a = el.animate(frames, opts);
    a.startTime = start;
    return a;
  };
  /**
   * Write a dot's position to its attributes.
   * @param {SVGCircleElement} d - dot
   * @param {Pt} p - position
   */
  const place = (d: SVGCircleElement, p: Pt) => {
    d.setAttribute('cx', `${p.x}`);
    d.setAttribute('cy', `${p.y}`);
  };
  /**
   * Write a dot's radius and stroke width to its attributes.
   * @param {SVGCircleElement} d - dot
   * @param {string} r - radius
   * @param {string} sw - stroke width
   */
  const size = (d: SVGCircleElement, r: string, sw: string) => {
    d.setAttribute('r', r);
    d.setAttribute('stroke-width', sw);
  };
  /**
   * A dot's rendered position in group space, including running animations.
   * @param {SVGCircleElement} d - dot
   */
  const rendered = (d: SVGCircleElement): Pt => {
    const cs = getComputedStyle(d);
    const x = parseFloat(cs.getPropertyValue('cx'));
    const y = parseFloat(cs.getPropertyValue('cy'));
    return {
      x: Number.isFinite(x) ? x : parseFloat(d.getAttribute('cx') ?? `${C}`),
      y: Number.isFinite(y) ? y : parseFloat(d.getAttribute('cy') ?? `${C}`),
    };
  };
  /**
   * Whether an animation moves a dot (animates cx / cy).
   * @param {Animation} a - animation
   */
  const isMove = (a: Animation) =>
    ((a.effect as KeyframeEffect | null)?.getKeyframes() ?? []).some(
      (f) => f.cx != null || f.cy != null
    );

  // ── transition lifecycle ────────────────────────────────────────────────────

  /**
   * Start a transition; returns its id.
   */
  const begin = () => {
    busy = true;
    return ++move;
  };
  /**
   * Finish transition `id` and run any queued request; false if it was superseded.
   * @param {number} id - transition id
   */
  const land = (id: number) => {
    if (id !== move) {
      return false;
    }
    busy = false;
    const next = pending;
    pending = null;
    if (next) {
      void request(next.target).then(next.resolve);
    }
    return true;
  };
  /**
   * Resolve when `anims` finish, landing transition `id`.
   * @param {number} id - transition id
   * @param {Animation[]} anims - animations to wait for
   * @param {Function} onLand - called first if the transition is still current
   */
  const settle = (id: number, anims: Animation[], onLand?: () => void) =>
    Promise.all(anims.map((a) => a.finished)).then(
      () => {
        if (id === move) {
          onLand?.();
        }
        return land(id);
      },
      () => land(id)
    );

  // ── spin ────────────────────────────────────────────────────────────────────

  /**
   * A rotation keyframe.
   * @param {number} deg - angle in degrees
   */
  const rotate = (deg: number): Keyframe => ({
    transform: `rotate(${deg}deg)`,
  });
  /**
   * The group's rendered rotation as [a, b, c, d].
   */
  const spinMatrix = () => {
    const m = getComputedStyle(group).transform.match(/matrix\(([^)]+)\)/);
    return m ? m[1].split(',').map(Number) : [1, 0, 0, 1];
  };
  /**
   * Current spin speed in deg/ms.
   */
  const spinSpeed = () =>
    !spinning
      ? 0
      : ramp
        ? SPIN * Math.min(1, Math.max(0, (now() - ramp.start) / ramp.dur))
        : SPIN;
  /**
   * Stop the spin and clear the group transform.
   */
  const stopSpin = () => {
    cancelAll(group);
    group.style.transform = '';
    spinning = false;
    ramp = null;
  };
  /**
   * Accelerate from rest to the steady spin over `dur`, then spin forever.
   * @param {number} start - timeline start time in ms
   * @param {number} dur - ramp duration in ms
   */
  const spinUp = (start: number, dur: number) => {
    const [a, b] = spinMatrix();
    const from = toDeg(Math.atan2(b, a));
    const to = from + (SPIN * dur) / 2;
    stopSpin();
    spinning = true;
    const current = (ramp = { start, dur });
    const up = play(
      group,
      [rotate(from), rotate(to)],
      { duration: dur, easing: RAMP_EASE, fill: 'forwards' },
      start
    );
    up.finished.then(() => {
      if (ramp !== current) {
        return;
      }
      ramp = null;
      play(
        group,
        [rotate(to), rotate(to + 360)],
        { duration: ROT, iterations: Infinity },
        start + dur
      );
      cancel(up);
    }, noop);
  };

  // ── pulse ───────────────────────────────────────────────────────────────────

  /**
   * Start dot `i`'s pulse.
   * @param {number} i - element index
   * @param {number} start - timeline start time in ms
   * @param {number} iterations - pulse cycles (Infinity to loop)
   */
  const startPulse = (i: number, start: number, iterations = Infinity) =>
    (pulses[i] = play(
      dots[i],
      PULSE,
      { duration: LOOP, iterations, fill: 'forwards' },
      start
    ));
  /**
   * First pulse-grid time for `slot` at or after `ready`.
   * @param {number} slot - pulse slot
   * @param {number} ready - earliest start time in ms
   */
  const slotTime = (slot: number, ready: number) => {
    const first = pulseOrigin + STAGGER * slot;
    return first + LOOP * Math.max(0, Math.ceil((ready - first) / LOOP));
  };
  /**
   * Give the first `order.length` roles these pulse slots. Unchanged slots keep
   * pulsing untouched. If any slot changes, every running pulse finishes its
   * current cycle and the grid restarts after the latest one, so no pulse is
   * cut short.
   * @param {number[]} order - pulse slot per role
   */
  const orderPulses = (order: readonly number[]) => {
    const t = now();
    const ids = roles.slice(0, order.length);
    if (ids.some((i, role) => pulses[i] && slots[i] !== order[role])) {
      const ends = ids.map((i) => {
        const p = pulses[i];
        pulses[i] = null;
        const s = p?.startTime as number | null | undefined;
        if (!p || s == null) {
          return t;
        }
        if (t <= s) {
          cancel(p);
          return t;
        }
        const n = Math.ceil((t - s) / LOOP);
        p.effect?.updateTiming({ iterations: n });
        return s + LOOP * n;
      });
      pulseOrigin = Math.max(
        ...ends.map((e, role) => e - STAGGER * order[role])
      );
    }
    ids.forEach((i, role) => {
      slots[i] = order[role];
      if (!pulses[i]) {
        startPulse(i, slotTime(order[role], t));
      }
    });
  };

  // ── shrink ──────────────────────────────────────────────────────────────────

  /**
   * Shrink a dot to nothing from its current size.
   * @param {SVGCircleElement} d - dot
   * @param {number} start - timeline start time in ms
   * @param {number} duration - duration in ms
   */
  const shrink = (d: SVGCircleElement, start: number, duration: number) => {
    const cs = getComputedStyle(d);
    return play(
      d,
      [
        {
          r: cs.getPropertyValue('r') || d.getAttribute('r') || R_REST,
          strokeWidth: cs.getPropertyValue('stroke-width') || SW1,
        },
        { r: R0, strokeWidth: SW0 },
      ],
      { duration, easing: EO, fill: 'forwards' },
      start
    );
  };

  // ── static end states (reduced motion, no WAAPI) ────────────────────────────

  /**
   * Paint a static end state (reduced motion, no WAAPI).
   * @param {string} target - 'line', 'triangle', 'square' or 'out'
   */
  const snap = (target: Shape | 'out') => {
    [group, ...dots].forEach(cancelAll);
    stopSpin();
    pulses.fill(null);
    roles = [0, 1, 2, 3];
    const pts =
      target === 'triangle'
        ? TRI_DEG.map((deg) => polar(deg, R_VERTEX))
        : target === 'square'
          ? SQR_DEG.map((deg) => polar(deg, R_VERTEX))
          : target === 'line'
            ? LINE
            : [];
    dots.forEach((d, i) => {
      d.style.cssText = '';
      place(d, pts[i] ?? LINE[Math.min(i, 2)]);
      size(d, pts[i] ? R_REST : '0', pts[i] ? SW1 : '0');
    });
    shape = target === 'out' ? 'line' : target;
    visible = target !== 'out';
  };

  // ── transitions ─────────────────────────────────────────────────────────────

  /**
   * Load the three dots in, then queue `then`.
   * @param {string|null} then - state to go to once loaded in
   * @param {boolean} loop - whether the pulse repeats
   * @param {Function} resolve - called with whether `then` was reached
   */
  const loadIn = (
    then: Target | null,
    loop: boolean,
    resolve: (landed: boolean) => void = noop
  ) => {
    const id = begin();
    const t0 = now();
    pulseOrigin = t0 + LOAD;
    const ds = inRoles(3);
    const ins = ds.map((d, role) => {
      slots[roles[role]] = role;
      startPulse(
        roles[role],
        pulseOrigin + STAGGER * role,
        loop ? Infinity : 1
      );
      return play(
        d,
        LOAD_IN,
        { duration: LOAD, fill: 'forwards' },
        t0 + STAGGER * role
      );
    });
    if (then) {
      pending = { target: then, resolve };
    }
    if (!loop) {
      // One cycle, then each dot shrinks out after its own pulse.
      let left = ds.length;
      ds.forEach((d, role) =>
        pulses[roles[role]]!.finished.then(() => {
          if (move !== id) {
            return;
          }
          size(d, R_REST, SW1);
          d.getAnimations().forEach(cancel);
          shrink(d, now() + OUT_STAGGER * role, OUT);
          if (--left === 0) {
            visible = false;
          }
        }, noop)
      );
    }
    return settle(id, ins, () => {
      ds.forEach((d) => size(d, R_REST, SW1));
      ins.forEach(cancel);
    });
  };

  /**
   * Line → triangle / square: funnel through the 180° entry point while the spin ramps up.
   * @param {string} target - 'triangle' or 'square'
   */
  const form = (target: 'triangle' | 'square') => {
    const id = begin();
    const t = now();
    const tri = target === 'triangle';
    const stagger = tri ? FORM_STAGGER_TRI : FORM_STAGGER_SQR;
    const degs = tri ? TRI_DEG : SQR_DEG;
    const n = stagger.length;
    shape = target;
    if (!tri) {
      const i = roles[3];
      const spare = dots[i];
      cancelAll(spare);
      spare.style.cssText = '';
      size(spare, '0', '0');
      place(spare, SPAWN);
      play(
        spare,
        LOAD_IN,
        { duration: LOAD, fill: 'forwards' },
        t + stagger[3]
      );
      slots[i] = 3;
      startPulse(i, slotTime(3, t + stagger[3] + LOAD));
    }
    spinUp(t, FORM + stagger[n - 1] - RAMP_LEAD);
    const ds = inRoles(n);
    const moves = ds.map((d, role) =>
      play(
        d,
        formationFrames(
          role === 3 ? SPAWN : LINE[role],
          degs[role],
          tri && role === 0
        ),
        { duration: FORM, easing: EF, fill: 'forwards' },
        t + stagger[role]
      )
    );
    return settle(id, moves, () => {
      ds.forEach((d, role) => place(d, polar(degs[role], R_VERTEX)));
      // The grown-in dot rests at full size once the square lands.
      if (!tri) {
        size(ds[3], R_REST, SW1);
      }
      moves.forEach(cancel);
      if (tri) {
        orderPulses(TRI_PULSE);
      }
    });
  };

  /**
   * Shape → line. The spin is baked into each dot's coordinates in the frame
   * it stops, every dot keeps orbiting clockwise from the speed it was going
   * (Hermite ease with a matched start slope), and roles are reassigned so the
   * shape always turns MIN_ARC to MIN_ARC + one symmetry step.
   */
  const unwind = () => {
    const id = begin();
    const t = now();
    const square = shape === 'square';
    const ids = roles.slice(0, square ? 4 : 3);
    const ds = ids.map((i) => dots[i]);
    const speed = spinSpeed();
    const [a, b, c, d] = spinMatrix();
    const pts = ds.map((dot) => {
      const p = rendered(dot);
      const sx = a * (p.x - C) + c * (p.y - C);
      const sy = b * (p.x - C) + d * (p.y - C);
      return {
        deg: toDeg(Math.atan2(sy, sx)),
        r: Math.hypot(sx, sy),
        x: C + sx,
        y: C + sy,
      };
    });
    stopSpin();
    ds.forEach((dot, k) => {
      dot.getAnimations().filter(isMove).forEach(cancel);
      place(dot, pts[k]);
    });

    // The lead dot takes the left; the rest take roles by clockwise order behind it.
    /**
     * Clockwise travel to 180° beyond MIN_ARC, for dot `k`.
     * @param {number} k - dot index in this unwind
     */
    const beyondMin = (k: number) => mod360(mod360(180 - pts[k].deg) - MIN_ARC);
    const lead = pts.reduce(
      (m, _, k) => (beyondMin(k) < beyondMin(m) ? k : m),
      0
    );
    const shared = MIN_ARC + beyondMin(lead);
    const behind = pts
      .map((_, k) => k)
      .filter((k) => k !== lead)
      .sort(
        (p, q) =>
          mod360(pts[p].deg - pts[lead].deg) -
          mod360(pts[q].deg - pts[lead].deg)
      );
    const role: number[] = [];
    role[lead] = 0;
    if (square) {
      [role[behind[0]], role[behind[1]], role[behind[2]]] = [3, 2, 1];
    } else {
      [role[behind[0]], role[behind[1]]] = [2, 1];
    }

    const sweeps = pts.map((p, k) => {
      const deg = UNWIND[role[k]].deg;
      if (deg === null) {
        return shared;
      }
      const extra = mod360(deg - (p.deg + shared));
      return shared + (extra > 359.5 ? 0 : extra);
    });
    const dur = QUICK * Math.max(1, Math.max(...sweeps) / 330);
    const moves = ds.map((dot, k) => {
      const to = UNWIND[role[k]];
      const slope = sweeps[k] > 0 ? Math.min(3, (speed * dur) / sweeps[k]) : 0;
      return play(
        dot,
        orbitFrames(pts[k], sweeps[k], to.r, slope, to.pos),
        { duration: dur, fill: 'forwards' },
        t
      );
    });

    const next = [...roles];
    role.forEach((r, k) => (next[r] = ids[k]));
    roles = next;
    shape = 'line';
    const spare = square ? dots[roles[3]] : null;
    if (spare) {
      moves.push(shrink(spare, t, dur));
    }
    orderPulses([0, 1, 2]);

    return settle(id, moves, () => {
      ds.forEach((dot, k) => place(dot, UNWIND[role[k]].pos));
      moves.forEach(cancel);
      if (spare) {
        cancelAll(spare);
        pulses[roles[3]] = null;
        size(spare, '0', '0');
      }
    });
  };

  /**
   * Bob each dot up and back.
   */
  const doWiggle = () => {
    const id = begin();
    const t = now();
    const hops = inRoles(3).map((d, role) => {
      const y = LINE[role].y;
      return play(
        d,
        [
          { cy: `${y}px`, easing: EF },
          { cy: `${y - 6}px`, offset: 0.5, easing: EF },
          { cy: `${y}px` },
        ],
        { duration: WIGGLE },
        t + WIGGLE_STAGGER * role
      );
    });
    return settle(id, hops);
  };

  /**
   * Start the transition to `target` (not busy).
   * @param {string} target - state to go to
   */
  const go = (target: Target): Promise<boolean> => {
    if (target === 'wiggle') {
      return shape === 'line' ? doWiggle() : Promise.resolve(false);
    }
    if (target === shape) {
      return Promise.resolve(true);
    }
    if (target === 'line') {
      return unwind();
    }
    if (shape === 'line') {
      return form(target);
    }
    // Triangle ↔ square: unwind to the line, then form the other shape.
    return new Promise((resolve) => {
      pending = { target, resolve };
      void unwind();
    });
  };

  /**
   * Go to `target`, queueing it if a transition is in flight.
   * @param {string} target - state to go to
   */
  const request = (target: Target): Promise<boolean> => {
    // Nothing showing (after out): load in again, then go to the target.
    if (!visible) {
      return target === 'wiggle'
        ? Promise.resolve(false)
        : run(target === 'line' ? 'loading' : target, loopForever, staticOnly);
    }
    if (staticOnly) {
      if (target !== 'wiggle') {
        snap(target);
      }
      return Promise.resolve(target !== 'wiggle' || shape === 'line');
    }
    if (busy) {
      pending?.resolve(false);
      return new Promise((resolve) => (pending = { target, resolve }));
    }
    return go(target);
  };

  /**
   * Shrink every dot to nothing from wherever it is.
   */
  const out = (): Promise<boolean> => {
    if (!visible) {
      return Promise.resolve(false);
    }
    pending?.resolve(false);
    pending = null;
    const id = begin();
    if (staticOnly) {
      snap('out');
      return Promise.resolve(land(id));
    }
    const t = now();
    // Freeze every dot where it is (the spin keeps turning), then shrink each.
    const shrinks = roles.map((i, k) => {
      const d = dots[i];
      const cs = getComputedStyle(d);
      const p = rendered(d);
      const r = cs.getPropertyValue('r') || '0';
      const sw = cs.getPropertyValue('stroke-width') || '0';
      cancelAll(d);
      place(d, p);
      size(d, r, sw);
      return shrink(d, t + OUT_STAGGER * k, OUT);
    });
    pulses.fill(null);
    return settle(id, shrinks, () => {
      stopSpin();
      dots.forEach((d) => {
        cancelAll(d);
        size(d, '0', '0');
      });
      visible = false;
      shape = 'line';
    });
  };

  /**
   * Restart from nothing and go to `mode`.
   * @param {ProcessingMode} mode - state to go to
   * @param {boolean} loop - whether the loading pulse repeats
   * @param {boolean} isStatic - paint end states only
   */
  const run = (
    mode: ProcessingMode,
    loop: boolean,
    isStatic: boolean
  ): Promise<boolean> => {
    move++;
    busy = false;
    pending?.resolve(false);
    pending = null;
    staticOnly = isStatic;
    loopForever = loop;
    [group, ...dots].forEach(cancelAll);
    stopSpin();
    pulses.fill(null);
    roles = [0, 1, 2, 3];
    shape = 'line';
    visible = true;
    dots.forEach((d, i) => {
      d.style.cssText = '';
      size(d, '0', '0');
      place(d, i < 3 ? LINE[i] : SPAWN);
    });
    if (staticOnly) {
      snap(mode === 'loading' ? 'line' : mode);
      return Promise.resolve(true);
    }
    if (mode === 'out') {
      inRoles(3).forEach((d) => size(d, R_REST, SW1));
      return out();
    }
    if (mode === 'loading') {
      return loadIn(null, loop);
    }
    return new Promise((resolve) => void loadIn(mode, true, resolve));
  };

  /**
   * Go to `mode`, restarting when nothing is showing or options changed.
   * @param {ProcessingMode} mode - state to go to
   * @param {boolean} loop - whether the loading pulse repeats
   * @param {boolean} isStatic - paint end states only
   */
  const setMode = (mode: ProcessingMode, loop: boolean, isStatic: boolean) =>
    !visible || loop !== loopForever || isStatic !== staticOnly
      ? run(mode, loop, isStatic)
      : mode === 'out'
        ? out()
        : request(mode === 'loading' ? 'line' : mode);

  return {
    run,
    setMode,
    /**
     *
     */
    toLoading: () => request('line'),
    /**
     *
     */
    toTriangle: () => request('triangle'),
    /**
     *
     */
    toSquare: () => request('square'),
    /**
     *
     */
    wiggle: () => request('wiggle'),
    out,
    /**
     *
     */
    destroy: () => {
      move++;
      pending?.resolve(false);
      pending = null;
      [group, ...dots].forEach(cancelAll);
      visible = false;
    },
  };
}
