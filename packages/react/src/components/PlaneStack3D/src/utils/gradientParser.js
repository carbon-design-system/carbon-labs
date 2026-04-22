/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable jsdoc/require-param, jsdoc/require-param-type, jsdoc/require-param-description */

import * as THREE from 'three';

// Cache for gradient textures
const gradientCache = new Map();

/**
 * Creates a Three.js texture from a CSS gradient string
 * Uses a hidden canvas element to render the gradient
 * @param cssGradient
 */
export const createGradientTexture = (cssGradient) => {
  // Check cache first
  const cacheKey = cssGradient;
  const cached = gradientCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Create a canvas
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Create a temporary div to render the gradient
  const tempDiv = document.createElement('div');
  tempDiv.style.width = '512px';
  tempDiv.style.height = '512px';
  tempDiv.style.background = cssGradient;
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  document.body.appendChild(tempDiv);

  // Use html2canvas-like approach: draw the div onto canvas
  // Since we can't easily do that, let's parse and draw manually
  document.body.removeChild(tempDiv);

  // Parse the gradient manually for canvas
  const match = cssGradient.match(/linear-gradient\((.+)\)/);
  if (!match) {
    console.warn('Could not parse gradient:', cssGradient);
    return null;
  }

  // Split by commas, but not commas inside parentheses (for rgba, etc.)
  const params = [];
  let current = '';
  let depth = 0;

  for (let i = 0; i < match[1].length; i++) {
    const char = match[1][i];
    if (char === '(') {
      depth++;
    }
    if (char === ')') {
      depth--;
    }

    if (char === ',' && depth === 0) {
      params.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current) {
    params.push(current.trim());
  }

  // Parse angle
  let angle = 180;
  let colorStops = params;

  if (params[0].includes('deg')) {
    angle = parseFloat(params[0]);
    colorStops = params.slice(1);
  } else if (params[0].startsWith('to ')) {
    const directions = {
      'to top': 0,
      'to right': 90,
      'to bottom': 180,
      'to left': 270,
    };
    angle = directions[params[0]] || 180;
    colorStops = params.slice(1);
  }

  // Convert angle to canvas gradient coordinates
  const rad = ((angle - 90) * Math.PI) / 180;
  const x0 = canvas.width / 2 + (Math.cos(rad) * canvas.width) / 2;
  const y0 = canvas.height / 2 + (Math.sin(rad) * canvas.height) / 2;
  const x1 = canvas.width / 2 - (Math.cos(rad) * canvas.width) / 2;
  const y1 = canvas.height / 2 - (Math.sin(rad) * canvas.height) / 2;

  // Create canvas gradient
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

  // Add color stops
  colorStops.forEach((stop, index) => {
    // Parse "color position%" format
    const parts = stop.trim().match(/^(.+?)\s+(\d+(?:\.\d+)?%?)$/);
    if (parts) {
      const color = parts[1].trim();
      const rawPosition = parseFloat(parts[2]) / 100;
      const position = Math.max(0, Math.min(1, rawPosition));
      gradient.addColorStop(position, color);
    } else {
      // No position specified, distribute evenly
      const position = index / (colorStops.length - 1);
      gradient.addColorStop(position, stop.trim());
    }
  });

  // Fill canvas with gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  // Cache it
  gradientCache.set(cacheKey, texture);

  return texture;
};

/**
 * Helper to check if a value is a CSS gradient string
 * @param value
 */
export const isGradient = (value) => {
  return typeof value === 'string' && value.includes('gradient(');
};
