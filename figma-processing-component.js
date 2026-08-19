/**
 * Processing v2 — Figma component generator
 *
 * Run this in the Figma plugin console (Plugins → Development → Open console,
 * paste the whole script, then press Enter / Run).
 *
 * What it builds
 * ──────────────
 * A "Processing" Component Set (variant group) with:
 *
 *   Property  Values
 *   ────────  ──────────────────────────────────────────
 *   Theme     white | g10 | g90 | g100
 *   AI        false | true
 *   State     Idle | Pulse-1 | Pulse-2 | Pulse-3
 *
 * State variants are wired with Smart Animate prototype transitions so the
 * three-dot loading pulse loops in presentation mode:
 *
 *   Idle  →(After delay 0ms)→  Pulse-1
 *   Pulse-1 →(Smart Animate 333ms ease-in-out)→  Pulse-2
 *   Pulse-2 →(Smart Animate 333ms ease-in-out)→  Pulse-3
 *   Pulse-3 →(Smart Animate 333ms ease-in-out)→  Idle
 *
 * Dot geometry (mirrors Processing.tsx constants)
 * ──────────────────────────────────────────────────
 *   Canvas  32 × 32 px
 *   Dot positions (cx, cy): (8,16)  (16,16)  (24,16)
 *   Resting radius  r_rs = 0.875 px  → Figma ellipse 1.75 × 1.75 px
 *   Peak    radius  r_mx = 2.5 px    → Figma ellipse 5.0  × 5.0  px
 *   Stroke width    sw1  = 1.72 px
 *   Fill: none (stroke only)
 *
 * Color tokens (mirrors Processing.module.css)
 * ─────────────────────────────────────────────
 *   Theme          Default stroke   AI stroke
 *   white / g10    #001141 blue-90  #002d9c blue-80
 *   g90 / g100     #f4f4f4 gray-10  #d0e2ff blue-20
 */

(async () => {
  await figma.loadAllPagesAsync();

  // ─── Constants ──────────────────────────────────────────────────────────────

  const CANVAS_SIZE  = 32;
  const R_RS_D       = 2.0;  // resting diameter (px) — r=1 doubled
  const R_MX_D       = 5.0;  // peak    diameter (px) — r=2.5 doubled
  const SW           = 2.0;  // stroke width
  const DOTS = [
    { cx: 8,  cy: 16 },
    { cx: 16, cy: 16 },
    { cx: 24, cy: 16 },
  ];

  // Stroke colours keyed by [theme][ai]
  const STROKE = {
    white: { false: { r: 0,      g: 0.067, b: 0.255 }, true: { r: 0,      g: 0.176, b: 0.612 } },
    g10:   { false: { r: 0,      g: 0.067, b: 0.255 }, true: { r: 0,      g: 0.176, b: 0.612 } },
    g90:   { false: { r: 0.957,  g: 0.957, b: 0.957 }, true: { r: 0.816,  g: 0.886, b: 1.0   } },
    g100:  { false: { r: 0.957,  g: 0.957, b: 0.957 }, true: { r: 0.816,  g: 0.886, b: 1.0   } },
  };

  // Background fill for each theme (for the outer frame so variants are legible)
  const BG = {
    white: { r: 1,     g: 1,     b: 1     },
    g10:   { r: 0.961, g: 0.961, b: 0.961 },
    g90:   { r: 0.153, g: 0.153, b: 0.161 },
    g100:  { r: 0.063, g: 0.063, b: 0.063 },
  };

  const THEMES = ['white', 'g10', 'g90', 'g100'];
  const AI_VALUES = [false, true];

  // Animation states: which dot index is at peak (or -1 = all resting)
  const STATES = [
    { name: 'Idle',    peakDot: -1 },
    { name: 'Pulse-1', peakDot: 0  },
    { name: 'Pulse-2', peakDot: 1  },
    { name: 'Pulse-3', peakDot: 2  },
  ];

  // ─── Helper: hex string → Figma RGB ─────────────────────────────────────────

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
  }

  // ─── Helper: create one stroke-only ellipse ──────────────────────────────────

  function makeDot(dotIndex, isPeak, strokeColor) {
    const diam   = isPeak ? R_MX_D : R_RS_D;
    const pos    = DOTS[dotIndex];
    const ellipse = figma.createEllipse();

    ellipse.name        = `dot-${dotIndex}`;
    ellipse.resize(diam, diam);

    // With strokeAlign CENTER, Figma's bounding box is (diam + SW) wide/tall.
    // Subtract half that total to land the visual centre exactly on pos.cx / pos.cy.
    ellipse.x = pos.cx - (diam + SW) / 2;
    ellipse.y = pos.cy - (diam + SW) / 2;

    // Stroke only — no fill
    ellipse.fills   = [];
    ellipse.strokes = [{ type: 'SOLID', color: strokeColor, opacity: 1 }];
    ellipse.strokeWeight = SW;
    ellipse.strokeAlign  = 'CENTER';

    return ellipse;
  }

  // ─── Helper: create one Processing variant component ────────────────────────
  // combineAsVariants requires COMPONENT nodes — createComponent() not createFrame()

  function makeVariant(theme, ai, state) {
    const strokeColor = STROKE[theme][String(ai)];
    const bgColor     = BG[theme];

    // Outer component — must be a COMPONENT node for combineAsVariants
    const comp = figma.createComponent();
    comp.name  = `Theme=${theme}, AI=${ai}, State=${state.name}`;
    comp.resize(CANVAS_SIZE, CANVAS_SIZE);
    comp.fills = [{ type: 'SOLID', color: bgColor }];
    comp.clipsContent = false; // dots briefly exceed bounds at peak

    // Inner group frame — a plain FRAME child is fine inside a COMPONENT
    const group = figma.createFrame();
    group.name         = 'dot-group';
    group.resize(CANVAS_SIZE, CANVAS_SIZE);
    group.fills        = [];
    group.clipsContent = false;
    group.x            = 0;
    group.y            = 0;

    // Add all three dots
    for (let i = 0; i < 3; i++) {
      const isPeak = state.peakDot === i;
      const dot    = makeDot(i, isPeak, strokeColor);
      group.appendChild(dot);
    }

    comp.appendChild(group);
    return comp;
  }

  // ─── Build all variants ──────────────────────────────────────────────────────

  const allVariants = [];

  for (const theme of THEMES) {
    for (const ai of AI_VALUES) {
      for (const state of STATES) {
        allVariants.push(makeVariant(theme, ai, state));
      }
    }
  }

  // ─── Assemble component set ───────────────────────────────────────────────────

  const componentSet = figma.combineAsVariants(allVariants, figma.currentPage);
  componentSet.name = 'Processing';

  // Tidy layout — arrange variants in a grid (4 states × 8 theme/ai combos)
  // combineAsVariants auto-lays them out, but we can adjust spacing.
  componentSet.layoutMode       = 'HORIZONTAL';
  componentSet.layoutWrap       = 'WRAP';
  componentSet.itemSpacing      = 24;
  componentSet.counterAxisSpacing = 24;
  componentSet.paddingLeft      = 24;
  componentSet.paddingRight     = 24;
  componentSet.paddingTop       = 24;
  componentSet.paddingBottom    = 24;
  componentSet.fills            = [{ type: 'SOLID', color: { r: 0.94, g: 0.94, b: 0.96 }, opacity: 0.5 }];
  componentSet.strokes          = [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 } }];
  componentSet.strokeWeight     = 1;
  componentSet.cornerRadius     = 4;

  // ─── Wire prototype transitions ──────────────────────────────────────────────
  //
  // For each (Theme × AI) combination, chain the 4 State variants:
  //   Idle  ──[After delay 0ms]──►  Pulse-1
  //   Pulse-1 ──[Smart Animate 333ms ease-in-out]──►  Pulse-2
  //   Pulse-2 ──[Smart Animate 333ms ease-in-out]──►  Pulse-3
  //   Pulse-3 ──[Smart Animate 333ms ease-in-out]──►  Idle
  //
  // This wires just the four STATES within each (theme, ai) combination.
  // The 333ms × 3 = ~1000ms per full cycle, roughly matching LOOP_DUR = 1000ms.

  for (const theme of THEMES) {
    for (const ai of AI_VALUES) {
      // Collect the 4 state nodes for this combination in order
      const stateNodes = STATES.map(state => {
        const name = `Theme=${theme}, AI=${ai}, State=${state.name}`;
        return allVariants.find(v => v.name === name);
      });

      // Wire Idle → Pulse-1
      if (stateNodes[0] && stateNodes[1]) {
        await stateNodes[0].setReactionsAsync([{
          actions: [{
            type: 'NODE',
            destinationId: stateNodes[1].id,
            navigation: 'CHANGE_TO',
            transition: {
              type: 'SMART_ANIMATE',
              easing: { type: 'EASE_IN_AND_OUT' },
              duration: 333,
            },
            preserveScrollPosition: false,
          }],
          trigger: { type: 'AFTER_TIMEOUT', timeout: 0.1 },
        }]);
      }

      // Wire Pulse-1 → Pulse-2
      if (stateNodes[1] && stateNodes[2]) {
        await stateNodes[1].setReactionsAsync([{
          actions: [{
            type: 'NODE',
            destinationId: stateNodes[2].id,
            navigation: 'CHANGE_TO',
            transition: {
              type: 'SMART_ANIMATE',
              easing: { type: 'EASE_IN_AND_OUT' },
              duration: 333,
            },
            preserveScrollPosition: false,
          }],
          trigger: { type: 'AFTER_TIMEOUT', timeout: 0.333 },
        }]);
      }

      // Wire Pulse-2 → Pulse-3
      if (stateNodes[2] && stateNodes[3]) {
        await stateNodes[2].setReactionsAsync([{
          actions: [{
            type: 'NODE',
            destinationId: stateNodes[3].id,
            navigation: 'CHANGE_TO',
            transition: {
              type: 'SMART_ANIMATE',
              easing: { type: 'EASE_IN_AND_OUT' },
              duration: 333,
            },
            preserveScrollPosition: false,
          }],
          trigger: { type: 'AFTER_TIMEOUT', timeout: 0.333 },
        }]);
      }

      // Wire Pulse-3 → Idle (loop back)
      if (stateNodes[3] && stateNodes[0]) {
        await stateNodes[3].setReactionsAsync([{
          actions: [{
            type: 'NODE',
            destinationId: stateNodes[0].id,
            navigation: 'CHANGE_TO',
            transition: {
              type: 'SMART_ANIMATE',
              easing: { type: 'EASE_IN_AND_OUT' },
              duration: 333,
            },
            preserveScrollPosition: false,
          }],
          trigger: { type: 'AFTER_TIMEOUT', timeout: 0.333 },
        }]);
      }
    }
  }

  // ─── Scroll the viewport to the new component set ────────────────────────────

  figma.viewport.scrollAndZoomIntoView([componentSet]);

  figma.notify(
    `✅ Processing component set created — ${allVariants.length} variants (${THEMES.length} themes × 2 AI × 4 states).`,
    { timeout: 4000 }
  );

})().catch(err => {
  figma.notify(`❌ Error: ${err.message}`, { error: true });
  console.error(err);
});
