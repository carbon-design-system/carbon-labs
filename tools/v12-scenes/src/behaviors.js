/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The behavior tier: each scenario's scene (a story of `V12/Scenes`) opened
// in each of its themes, with and without reduced motion, driven through its
// actions while the sampler records every frame, then checked against its
// invariants. A failure leaves its frames and a contact sheet of the frames
// that broke a rule.

import fs from 'node:fs';
import path from 'node:path';
import { installSampler } from './sampler.js';
import { check, tracked } from './invariants.js';
import {
  contactSheet,
  frameNear,
  readRegions,
  sampleFor,
  startScreencast,
} from './frames.js';
import { storyPath } from './story.js';

/**
 * Playwright's bundled Chromium: the build this Playwright names, or, when
 * that one is not installed, the newest Chromium build Playwright has
 * installed (never a system browser).
 *
 * @param {typeof import('@playwright/test').chromium} chromium The launcher.
 * @returns {Promise<import('@playwright/test').Browser>} The browser.
 */
export async function launchChromium(chromium) {
  const want = chromium.executablePath();
  if (fs.existsSync(want)) {
    return chromium.launch({ channel: 'chromium', headless: true });
  }
  // `.../ms-playwright/chromium-<build>/<platform dir>/<app path>`
  const parts = want.split(path.sep);
  const at = parts.findIndex((p) => /^chromium-\d+$/.test(p));
  if (at > 0) {
    const cache = parts.slice(0, at).join(path.sep);
    const tail = parts.slice(at + 1).join(path.sep);
    const builds = fs
      .readdirSync(cache)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort((a, b) => Number(b.slice(9)) - Number(a.slice(9)));
    for (const b of builds) {
      const exe = path.join(cache, b, tail);
      if (fs.existsSync(exe)) {
        console.warn(`behaviors: ${parts[at]} is not installed; using ${b}`);
        return chromium.launch({ executablePath: exe, headless: true });
      }
    }
  }
  return chromium.launch({ channel: 'chromium', headless: true });
}

/** The viewport every scene runs in. */
export const VIEWPORT = { width: 1440, height: 900 };
/** Device pixels per CSS pixel: wholePixels checks this grid. */
export const DPR = 2;

/** A host's story id. */
export const storyOf = (host) => `v12-scenes--${host}`;

/**
 * A scene's arguments in the form Storybook reads from the address.
 *
 * @param {Record<string, string | number | boolean>} args The arguments.
 * @returns {string} `key:value;…`, booleans as `!true` and `!false`.
 */
export function argsParam(args = {}) {
  return Object.entries(args)
    .map(([k, v]) => `${k}:${typeof v === 'boolean' ? `!${v}` : v}`)
    .join(';');
}

/**
 * Every run of the scenarios: each in its themes, with and without reduced
 * motion.
 *
 * @param {object[]} scenarios The scenarios.
 * @param {{ themes?: string[] }} [o] Themes for every scenario, in place of
 *   each one's own.
 * @returns {object[]} `{ scenario, theme, reduced }` for each run.
 */
export function runsOf(scenarios, o = {}) {
  const out = [];
  for (const scenario of scenarios) {
    const themes = o.themes ?? scenario.themes ?? ['v12-light'];
    const reduced = scenario.reduced ?? [false, true];
    for (const theme of themes) {
      for (const r of reduced) {
        out.push({ scenario, theme, reduced: r });
      }
    }
  }
  return out;
}

/** A file-safe name for a run. */
export function runName({ scenario, theme, reduced }) {
  return `${scenario.id.replace(/[^a-z0-9]+/gi, '-')}--${theme}${
    reduced ? '--reduced' : ''
  }`;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Runs one action in the page.
 *
 * @param {import('@playwright/test').Page} page The page.
 * @param {object} a The action.
 * @param {object} ctx The run so far: `clocks` (each action's measured
 *   duration, ms), `scenario`.
 */
async function act(page, a, ctx) {
  const name = a.name ?? a.do;
  const settle = async () => {
    await page.evaluate(
      ([q, t]) => window.__sampler.settle(q, t),
      [a.quiet ?? 12, a.timeout ?? 4000]
    );
  };
  switch (a.do) {
    case 'set': {
      await page.evaluate(
        ([n, s]) => window.__sampler.act(n, () => window.__scene.set(s)),
        [name, a.state]
      );
      break;
    }
    case 'turn': {
      // The way back, part of the way into the way there: at `at` of the
      // way there's own clock, as measured on its first full run.
      const clock = ctx.clocks[a.clock] ?? 300;
      await page.evaluate(
        async ([n, s, back, ms]) => {
          await window.__sampler.act(n, () => window.__scene.set(s));
          const start = performance.now();
          await new Promise((resolve) => {
            const tick = () =>
              performance.now() - start >= ms
                ? resolve()
                : requestAnimationFrame(tick);
            requestAnimationFrame(tick);
          });
          await window.__sampler.act(`${n}-back`, () =>
            window.__scene.set(back)
          );
        },
        [name, a.state, a.back, clock * (a.at ?? 0.45)]
      );
      break;
    }
    case 'repeat': {
      // Each state a third of the measured clock after the last.
      const clock = ctx.clocks[a.clock] ?? 300;
      await page.evaluate(
        async ([n, states, ms]) => {
          for (let i = 0; i < states.length; i++) {
            const s = states[i];
            await window.__sampler.act(`${n}-${i}`, () =>
              window.__scene.set(s)
            );
            if (i < states.length - 1) {
              const start = performance.now();
              await new Promise((resolve) => {
                const tick = () =>
                  performance.now() - start >= ms
                    ? resolve()
                    : requestAnimationFrame(tick);
                requestAnimationFrame(tick);
              });
            }
          }
        },
        [name, a.states, clock / 3]
      );
      break;
    }
    case 'wheel': {
      const box = await page.evaluate(
        (t) => window.__sampler.box(t),
        a.over ?? '__none__'
      );
      const x = box ? box.left + box.width / 2 : VIEWPORT.width / 2;
      const y = box
        ? Math.min(box.top + box.height / 2, VIEWPORT.height - 40)
        : VIEWPORT.height / 2;
      await page.mouse.move(x, Math.max(y, 120));
      await page.evaluate((n) => window.__sampler.mark(n), name);
      for (const dy of a.steps) {
        await page.mouse.wheel(0, dy);
        await wait(a.every ?? 16);
      }
      break;
    }
    case 'theme': {
      await page.evaluate(
        ([n, theme]) =>
          window.__sampler.act(n, () => {
            const channel = window.__STORYBOOK_ADDONS_CHANNEL__;
            if (channel) {
              channel.emit('updateGlobals', { globals: { theme } });
            } else {
              document.documentElement.setAttribute('data-carbon-theme', theme);
            }
          }),
        [name, a.to]
      );
      break;
    }
    case 'hover': {
      const targets = await page.locator(a.targets).all();
      for (let i = 0; i < targets.length; i++) {
        const b = await targets[i].boundingBox();
        if (!b) {
          continue;
        }
        await page.evaluate((n) => window.__sampler.mark(n), `${name}-${i}`);
        await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, {
          steps: 2,
        });
        await wait(a.each ?? 300);
      }
      if (a.leave) {
        await page.evaluate((n) => window.__sampler.mark(n), `${name}-leave`);
        await page.mouse.move(VIEWPORT.width - 20, VIEWPORT.height - 20);
      }
      break;
    }
    case 'click': {
      const target = page.locator(a.target).nth(a.nth ?? 0);
      await target.scrollIntoViewIfNeeded();
      const b = await target.boundingBox();
      await page.evaluate((n) => window.__sampler.mark(n), name);
      await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
      break;
    }
    case 'wait': {
      await wait(a.ms);
      return;
    }
    default:
      throw new Error(`behaviors: no action ${a.do}`);
  }
  if (a.settle !== false) {
    await settle();
  }
}

/** Steps run before sampling starts: a scroll position, an opening. */
async function setUp(page, steps = []) {
  for (const s of steps) {
    if (s.do === 'scrollTo') {
      await page.evaluate(
        ([sel, y]) => {
          const el = sel ? document.querySelector(sel) : null;
          (el ?? window).scrollTo(0, y);
        },
        [s.scroller ?? null, s.y]
      );
    } else if (s.do === 'set') {
      await page.evaluate((st) => window.__scene.set(st), s.state);
    } else if (s.do === 'click') {
      await page
        .locator(s.target)
        .nth(s.nth ?? 0)
        .click();
    }
    await page.waitForTimeout(s.wait ?? 600);
  }
}

/**
 * Checks the compositor frames of a docked element: the band above it
 * (nothingAbove) and its own box against how it looked at rest
 * (notCollapsed, painted).
 *
 * @returns {Promise<object[]>} The run's `paint` frames.
 */
async function paintOf(scratch, frames, run, paint, windowScroll) {
  const out = [];
  const { samples } = run;
  const tops = samples
    .map((s) => s.el[paint.docked])
    .filter((b) => b && b.opacity > 0.5)
    .map((b) => b.top);
  if (!tops.length || !frames.length) {
    return out;
  }
  const stuckTop = Math.min(...tops);
  // How it looks at rest: the first frame, before the scroll.
  const restSample = samples[0];
  const restBox = restSample.el[paint.docked];
  const inset = 2;
  const boxRect = (b) => ({
    x: b.left + inset,
    y: b.top,
    width: b.width - 2 * inset,
    height: b.height,
  });
  const ref = restBox
    ? (await readRegions(scratch, frames[0], { box: boxRect(restBox) })).box
    : null;
  for (let k = 0; k < frames.length; k++) {
    const f = frames[k];
    const i = sampleFor(samples, f, windowScroll);
    if (i < 0) {
      continue;
    }
    const d = samples[i].el[paint.docked];
    const c = samples[i].el[paint.container];
    if (
      !d ||
      !c ||
      Math.abs(d.top - stuckTop) > 0.75 ||
      d.top === restBox?.top
    ) {
      continue;
    }
    const band =
      d.top - c.top >= 1
        ? {
            x: d.left + inset,
            y: c.top,
            width: d.width - 2 * inset,
            height: d.top - c.top,
          }
        : null;
    const regions = await readRegions(scratch, f, {
      band,
      box: boxRect(d),
    });
    out.push({
      frame: k,
      sample: i,
      wall: f.wall,
      scrollY: f.scrollY,
      band: regions.band,
      box: regions.box,
      ref,
    });
  }
  return out;
}

/**
 * Runs one scenario in one theme and motion setting.
 *
 * @param {import('@playwright/test').Browser} browser The browser.
 * @param {string} base The Storybook's address.
 * @param {{ scenario: object, theme: string, reduced: boolean }} r The run.
 * @param {{ out: string }} o Where evidence goes.
 * @returns {Promise<object>} The run's row for `behaviors.json`.
 */
export async function runOne(browser, base, r, o) {
  const { scenario, theme, reduced } = r;
  const dir = scenario.rtl ? 'rtl' : 'ltr';
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DPR,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') {
      errors.push(`console: ${m.text()}`);
    }
  });
  page.on('pageerror', (e) => errors.push(`page: ${e.message}`));
  const row = {
    component: scenario.component,
    host: scenario.host,
    args: scenario.args,
    theme,
    reduced,
    dir,
    scenario: scenario.id,
    status: 'pass',
    violations: [],
    evidence: [],
  };
  if (scenario.known) {
    row.known = scenario.known;
  }
  const started = Date.now();
  let frames = [];
  let run = null;
  let clocks = {};
  let scratch = null;
  try {
    await page.goto(
      `${base}${storyPath(storyOf(scenario.host), {
        theme,
        ...(scenario.rtl ? { dir: 'rtl' } : {}),
      })}&args=${encodeURIComponent(argsParam(scenario.args))}`,
      { waitUntil: 'load' }
    );
    await page.waitForFunction(
      () =>
        /sb-show-(main|errordisplay|nopreview)/.test(document.body.className),
      null,
      { timeout: 30000 }
    );
    await page.waitForFunction(() => !!window.__scene, null, {
      timeout: 15000,
    });
    // Fonts and first motions settle before the run.
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(scenario.warm ?? 800);
    await setUp(page, scenario.setup);
    await page.evaluate(installSampler);
    const paint = scenario.paint;
    const cast = await startScreencast(page, {
      format: paint ? 'png' : 'jpeg',
      quality: 70,
      ...VIEWPORT,
    });
    await page.evaluate(
      ([track, scroller]) => window.__sampler.start(track, scroller),
      [scenario.track, scenario.scroller ?? null]
    );
    await page.waitForTimeout(100);
    const ctx = { clocks: {} };
    for (const a of scenario.actions) {
      await act(page, a, ctx);
      // The clock of what just ran, for a later turn or repeat.
      const clock = await page.evaluate(
        (n) => window.__sampler.clock(n),
        a.name ?? a.do
      );
      if (clock != null && ctx.clocks[a.name ?? a.do] == null) {
        ctx.clocks[a.name ?? a.do] = clock;
      }
    }
    await page.waitForTimeout(150);
    run = await page.evaluate(() => window.__sampler.stop());
    frames = await cast.stop();
    run.dir = dir;
    run.dpr = DPR;
    run.fullClocks = o.fullClocks ?? null;
    clocks = clocksOf(run);
    scratch = await context.newPage();
    if (paint) {
      run.paint = await paintOf(
        scratch,
        frames,
        run,
        paint,
        !scenario.scroller
      );
    }
    const checks = reduced
      ? (scenario.reducedChecks ?? scenario.checks)
      : scenario.checks;
    row.violations = check(run, checks);
    row.violations.push(...tracked(run, Object.keys(scenario.track ?? {})));
    for (const e of errors) {
      row.violations.push({ invariant: 'loadsClean', frame: -1, detail: e });
    }
    const unsettled = run.marks.filter((m) => m.settled === false);
    for (const m of unsettled) {
      row.violations.push({
        invariant: 'settles',
        frame: m.frame,
        detail: `${m.name} was still moving after its timeout`,
      });
    }
  } catch (e) {
    row.violations.push({
      invariant: 'runs',
      frame: -1,
      detail: String(e.message ?? e).split('\n')[0],
    });
  }
  row.ms = Date.now() - started;
  if (row.violations.length) {
    row.status = statusOf(row.violations, scenario.known);
    if (row.status === 'fail' || o.knownEvidence) {
      row.evidence = await writeEvidence(scratch ?? (await context.newPage()), {
        r,
        row,
        run,
        frames,
        out: o.out,
      });
    }
  }
  row.violations = trim(row.violations);
  await context.close();
  return { row, clocks };
}

/**
 * The violations of the harness, not of a rule: the run did not run, the
 * story did not load clean, an action did not settle, or a tracked element
 * was never found. `known` never covers them.
 */
export const HARNESS = new Set(['runs', 'loadsClean', 'settles', 'tracked']);

/**
 * A run's status from its violations: `fail` for any harness violation;
 * otherwise `known` when the scenario is known or every violation is,
 * else `fail`; `pass` when there are none.
 *
 * @param {{ invariant: string, known?: string }[]} violations The run's.
 * @param {string} [known] The scenario's `known`, if any.
 * @returns {'pass' | 'fail' | 'known'} The status.
 */
export function statusOf(violations, known) {
  if (!violations.length) {
    return 'pass';
  }
  if (violations.some((v) => HARNESS.has(v.invariant))) {
    return 'fail';
  }
  if (known) {
    return 'known';
  }
  return violations.some((v) => !v.known) ? 'fail' : 'known';
}

/** Each action's clock in a run: from its mark to its end, ms. */
function clocksOf(run) {
  const out = {};
  for (const m of run.marks) {
    if (m.end != null && run.samples[m.end] && run.samples[m.frame]) {
      out[m.name] = run.samples[m.end].t - run.samples[m.frame].t;
    }
  }
  return out;
}

/** At most `n` violations of each invariant, then a count of the rest. */
function trim(violations, n = 12) {
  const by = new Map();
  for (const v of violations) {
    if (!by.has(v.invariant)) {
      by.set(v.invariant, []);
    }
    by.get(v.invariant).push(v);
  }
  const out = [];
  for (const [invariant, list] of by) {
    out.push(...list.slice(0, n));
    if (list.length > n) {
      out.push({
        invariant,
        frame: -1,
        detail: `and ${list.length - n} more frames`,
      });
    }
  }
  return out;
}

/**
 * Writes a failure's evidence: the samples, and a contact sheet of the
 * frames that broke a rule (compositor frames for the paint checks, the
 * frames nearest the samples for the others).
 *
 * @returns {Promise<string[]>} The files, relative to `out`.
 */
async function writeEvidence(scratch, { r, row, run, frames, out }) {
  const dir = path.join(out, 'evidence', runName(r));
  fs.mkdirSync(dir, { recursive: true });
  const files = [];
  if (run) {
    const { paint, ...rest } = run;
    const slim = {
      ...rest,
      paint: paint?.map(({ band, box, ref: _ref, ...p }) => ({
        ...p,
        band: band && { width: band.width, height: band.height },
        box: box && { width: box.width, height: box.height },
      })),
    };
    fs.writeFileSync(path.join(dir, 'samples.json'), JSON.stringify(slim));
    files.push(path.join(dir, 'samples.json'));
  }
  if (frames.length && run) {
    const picked = new Map();
    for (const v of row.violations) {
      if (v.frame < 0) {
        continue;
      }
      let k = -1;
      let label = '';
      if (v.paint) {
        const p = run.paint[v.frame];
        k = p?.frame ?? -1;
        label = `${v.invariant} · compositor ${k} · scroll ${p?.scrollY}`;
      } else if (run.samples[v.frame]) {
        k = frameNear(frames, run.samples[v.frame]);
        label = `${v.invariant} · frame ${v.frame} · ${run.samples[v.frame].t}ms`;
      }
      if (k >= 0 && !picked.has(k)) {
        picked.set(k, label);
      }
      if (picked.size >= 12) {
        break;
      }
    }
    if (picked.size) {
      const tiles = [...picked]
        .sort((a, b) => a[0] - b[0])
        .map(([k, label]) => ({ frame: frames[k], label }));
      // A paint failure: the docked element and the band above it, close.
      const p = run.paint?.find((x) => x.box);
      const d = p && run.samples[p.sample]?.el[r.scenario.paint.docked];
      const clip = d
        ? {
            x: Math.max(0, d.left - 24),
            y: Math.max(0, d.top - 48),
            width: Math.min(VIEWPORT.width, d.width + 48),
            height: d.height + 96,
          }
        : undefined;
      const png = await contactSheet(scratch, tiles, {
        columns: clip ? 2 : 3,
        clip,
        tileWidth: clip ? 720 : 480,
      });
      fs.writeFileSync(path.join(dir, 'sheet.png'), png);
      files.push(path.join(dir, 'sheet.png'));
    }
  }
  return files.map((f) => path.relative(out, f));
}

/**
 * Runs every run, a few at a time, and writes `behaviors.json`.
 *
 * @param {object} o `browser`, `base` (the Storybook's address), `runs`,
 *   `out`, `workers`, `ref`, and `log` (a line per run).
 * @returns {Promise<object>} The report.
 */
export async function runBehaviors(o) {
  const { browser, base, runs, out, workers = 2, log = () => {} } = o;
  fs.mkdirSync(out, { recursive: true });
  const report = {
    ref: o.ref ?? null,
    startedAt: new Date().toISOString(),
    runs: [],
  };
  // A scenario's runs in one theme go together, full motion first, so the
  // reduced run knows the full clock it must halve.
  const groups = new Map();
  runs.forEach((r, k) => {
    const key = `${r.scenario.id}\u0000${r.theme}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(k);
  });
  const jobs = [...groups.values()].map((ks) =>
    ks.sort((a, b) => Number(runs[a].reduced) - Number(runs[b].reduced))
  );
  let next = 0;
  const rows = new Array(runs.length);
  const worker = async () => {
    while (next < jobs.length) {
      let fullClocks = null;
      for (const k of jobs[next++]) {
        const { row, clocks } = await runOne(browser, base, runs[k], {
          out,
          knownEvidence: o.knownEvidence,
          fullClocks: runs[k].reduced ? fullClocks : null,
        });
        if (!runs[k].reduced) {
          fullClocks = clocks;
        }
        rows[k] = row;
        log(row);
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(workers, jobs.length) }, worker)
  );
  report.runs = rows;
  report.ms = rows.reduce((n, r) => n + (r?.ms ?? 0), 0);
  fs.writeFileSync(
    path.join(out, 'behaviors.json'),
    JSON.stringify(report, null, 1)
  );
  return report;
}
