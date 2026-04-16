import * as THREE from "three";

const focusRingGeometryCache = new Map();

export function getFocusRingGeometry(
  width,
  height,
  { thickness = 0.12, padding = 0.08 } = {},
) {
  const key = `${width}|${height}|${thickness}|${padding}`;
  const cached = focusRingGeometryCache.get(key);
  if (cached) return cached;

  const outerWidth = Math.max(0.1, width + padding * 2);
  const outerHeight = Math.max(0.1, height + padding * 2);
  const innerWidth = Math.max(0.01, outerWidth - thickness * 2);
  const innerHeight = Math.max(0.01, outerHeight - thickness * 2);

  const outerHalfW = outerWidth / 2;
  const outerHalfH = outerHeight / 2;
  const innerHalfW = innerWidth / 2;
  const innerHalfH = innerHeight / 2;

  const shape = new THREE.Shape();
  shape.moveTo(-outerHalfW, -outerHalfH);
  shape.lineTo(outerHalfW, -outerHalfH);
  shape.lineTo(outerHalfW, outerHalfH);
  shape.lineTo(-outerHalfW, outerHalfH);
  shape.closePath();

  const hole = new THREE.Path();
  hole.moveTo(-innerHalfW, -innerHalfH);
  hole.lineTo(-innerHalfW, innerHalfH);
  hole.lineTo(innerHalfW, innerHalfH);
  hole.lineTo(innerHalfW, -innerHalfH);
  hole.closePath();

  shape.holes.push(hole);
  const geometry = new THREE.ShapeGeometry(shape);
  focusRingGeometryCache.set(key, geometry);
  return geometry;
}

export default getFocusRingGeometry;

