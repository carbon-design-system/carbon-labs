/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// What the compositor put on screen: every frame the browser's screencast
// sends while an action runs, with its time and scroll offset. A scroll runs
// on its own thread, so a frame can show the page at a new offset before
// the page's own code has run for it; only these frames show that. Pixels
// are read in the browser (a canvas), so the tier needs no image library.

/**
 * Starts a screencast of the page's frames.
 *
 * @param {import('@playwright/test').Page} page The page.
 * @param {{ format?: 'png' | 'jpeg', quality?: number, width: number,
 *   height: number }} o The format, and the size to scale frames to (the
 *   viewport's, so a frame's pixels are CSS pixels).
 * @returns {Promise<{ stop: () => Promise<{ data: string, wall: number,
 *   scrollY: number, scrollX: number, format: string }[]> }>} A way to stop
 *   it, which returns the frames.
 */
export async function startScreencast(page, o) {
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  const format = o.format ?? 'jpeg';
  cdp.on('Page.screencastFrame', (e) => {
    frames.push({
      data: e.data,
      wall: e.metadata.timestamp * 1000,
      scrollY: e.metadata.scrollOffsetY,
      scrollX: e.metadata.scrollOffsetX,
      format,
    });
    cdp
      .send('Page.screencastFrameAck', { sessionId: e.sessionId })
      .catch(() => {});
  });
  await cdp.send('Page.startScreencast', {
    format,
    quality: o.quality ?? 70,
    maxWidth: o.width,
    maxHeight: o.height,
    everyNthFrame: 1,
  });
  return {
    async stop() {
      await cdp.send('Page.stopScreencast').catch(() => {});
      await cdp.detach().catch(() => {});
      return frames;
    },
  };
}

/**
 * Reads regions of frames' pixels, in a scratch page of the same browser.
 *
 * @param {import('@playwright/test').Page} scratch A blank page.
 * @param {{ data: string, format: string }} frame A screencast frame.
 * @param {Record<string, { x: number, y: number, width: number,
 *   height: number } | null>} rects The regions, in the frame's pixels.
 * @returns {Promise<Record<string, { width: number, height: number,
 *   data: number[] } | null>>} RGBA for each region.
 */
export function readRegions(scratch, frame, rects) {
  return scratch
    .evaluate(
      async ({ src, rects: want }) => {
        const blob = await (await fetch(src)).blob();
        const bmp = await createImageBitmap(blob);
        const canvas = new OffscreenCanvas(bmp.width, bmp.height);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(bmp, 0, 0);
        const out = {};
        for (const [k, r] of Object.entries(want)) {
          if (!r) {
            out[k] = null;
            continue;
          }
          const x = Math.max(0, Math.round(r.x));
          const y = Math.max(0, Math.round(r.y));
          const w = Math.min(bmp.width - x, Math.round(r.width));
          const h = Math.min(bmp.height - y, Math.round(r.height));
          if (w <= 0 || h <= 0) {
            out[k] = null;
            continue;
          }
          const bytes = ctx.getImageData(x, y, w, h).data;
          let bin = '';
          for (let i = 0; i < bytes.length; i += 0x8000) {
            bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
          }
          out[k] = { width: w, height: h, data: btoa(bin) };
        }
        return out;
      },
      { src: `data:image/${frame.format};base64,${frame.data}`, rects }
    )
    .then((out) => {
      for (const r of Object.values(out)) {
        if (r) {
          r.data = new Uint8Array(Buffer.from(r.data, 'base64'));
        }
      }
      return out;
    });
}

/**
 * A contact sheet: frames side by side, each labeled, as a PNG.
 *
 * @param {import('@playwright/test').Page} scratch A blank page.
 * @param {{ frame: { data: string, format: string }, label: string }[]} tiles
 *   The frames and their labels.
 * @param {{ clip?: { x: number, y: number, width: number, height: number },
 *   columns?: number, tileWidth?: number }} o What part of each frame, how
 *   many columns, and each tile's width.
 * @returns {Promise<Buffer>} The PNG.
 */
export async function contactSheet(scratch, tiles, o = {}) {
  const url = await scratch.evaluate(
    async ({ tiles: list, clip, columns, tileWidth }) => {
      const bitmaps = [];
      for (const t of list) {
        const blob = await (await fetch(t.src)).blob();
        bitmaps.push(await createImageBitmap(blob));
      }
      const first = bitmaps[0];
      const c = clip ?? {
        x: 0,
        y: 0,
        width: first.width,
        height: first.height,
      };
      const scale = tileWidth / c.width;
      const th = Math.round(c.height * scale) + 18;
      const cols = Math.min(columns, list.length);
      const rows = Math.ceil(list.length / cols);
      const canvas = new OffscreenCanvas(
        cols * (tileWidth + 4),
        rows * (th + 4)
      );
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#777';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '12px sans-serif';
      list.forEach((t, i) => {
        const x = (i % cols) * (tileWidth + 4);
        const y = Math.floor(i / cols) * (th + 4);
        ctx.drawImage(
          bitmaps[i],
          c.x,
          c.y,
          c.width,
          c.height,
          x,
          y + 18,
          tileWidth,
          th - 18
        );
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, tileWidth, 18);
        ctx.fillStyle = '#fff';
        ctx.fillText(t.label, x + 4, y + 13);
      });
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let s = '';
      for (let i = 0; i < bytes.length; i += 0x8000) {
        s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      }
      return btoa(s);
    },
    {
      tiles: tiles.map((t) => ({
        src: `data:image/${t.frame.format};base64,${t.frame.data}`,
        label: t.label,
      })),
      clip: o.clip ?? null,
      columns: o.columns ?? 4,
      tileWidth: o.tileWidth ?? 480,
    }
  );
  return Buffer.from(url, 'base64');
}

/**
 * The sample that was current when a compositor frame was drawn: with a
 * window scroll, the latest sample at the frame's scroll offset (the
 * page's layout for what the frame shows); otherwise the latest sample
 * before the frame's time.
 *
 * @param {object[]} samples The run's samples.
 * @param {{ wall: number, scrollY: number }} frame The frame.
 * @param {boolean} windowScroll The window is the scroller.
 * @returns {number} The sample's index, or -1.
 */
export function sampleFor(samples, frame, windowScroll) {
  if (windowScroll) {
    for (let i = samples.length - 1; i >= 0; i--) {
      if (Math.abs(samples[i].scroll.y - frame.scrollY) < 0.75) {
        return i;
      }
    }
    return -1;
  }
  let best = -1;
  for (let i = 0; i < samples.length; i++) {
    if (samples[i].wall <= frame.wall) {
      best = i;
    }
  }
  return best;
}

/**
 * The compositor frame nearest a sample, by time.
 *
 * @param {{ wall: number }[]} frames The frames.
 * @param {{ wall: number }} sample The sample.
 * @returns {number} The frame's index, or -1.
 */
export function frameNear(frames, sample) {
  let best = -1;
  let gap = Infinity;
  frames.forEach((f, i) => {
    const d = Math.abs(f.wall - sample.wall);
    if (d < gap) {
      gap = d;
      best = i;
    }
  });
  return best;
}
