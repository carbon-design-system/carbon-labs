/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Camera Configuration
 * Centralized camera settings for the 3D visualization
 */

export const CAMERA_CONFIG = Object.freeze({
  fov: 32, // Field of view in degrees
  near: 0.1, // Near clipping plane
  far: 2000, // Far clipping plane
} as const);

export const DIAGRAM_ROTATION_DEG = Object.freeze({
  x: 0,
  y: 0,
  z: 0,
} as const);
