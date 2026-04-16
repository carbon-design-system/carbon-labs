import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { ControlsProps } from './types/component-props';
import { getPrimaryCenterX } from './constants';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
type CameraPosition = [number, number, number];

function getBoundsCorners(center, size) {
  const [cx, cy, cz] = center;
  const [sx, sy, sz] = size;
  const hx = sx / 2;
  const hy = sy / 2;
  const hz = sz / 2;

  return [
    new THREE.Vector3(cx - hx, cy - hy, cz - hz),
    new THREE.Vector3(cx - hx, cy - hy, cz + hz),
    new THREE.Vector3(cx - hx, cy + hy, cz - hz),
    new THREE.Vector3(cx - hx, cy + hy, cz + hz),
    new THREE.Vector3(cx + hx, cy - hy, cz - hz),
    new THREE.Vector3(cx + hx, cy - hy, cz + hz),
    new THREE.Vector3(cx + hx, cy + hy, cz - hz),
    new THREE.Vector3(cx + hx, cy + hy, cz + hz),
  ];
}

function rotateOffset(
  offset: THREE.Vector3,
  deltaPitchDeg: number,
  deltaYawDeg: number,
) {
  const spherical = new THREE.Spherical().setFromVector3(offset);
  spherical.phi = clamp(
    spherical.phi + THREE.MathUtils.degToRad(deltaPitchDeg),
    0.1,
    Math.PI - 0.1,
  );
  spherical.theta += THREE.MathUtils.degToRad(deltaYawDeg);
  return new THREE.Vector3().setFromSpherical(spherical);
}

// Orbit controls that report camera/target, throttled to one per frame.
// Includes mouse tracking for subtle camera rotation based on mouse position.
function Controls({
  onChange,
  primaryColumnCount = 8,
  enableMouseTracking = true,
  isPointerInside = false,
  playIntroAnimation = false,
  onIntroAnimationComplete,
  sceneBounds = null,
}: ControlsProps) {
  const camera = useThree((state) => state.camera);
  const pointer = useThree((state) => state.pointer);
  const size = useThree((state) => state.size);
  const controlsRef = useRef<any>(null);
  const rafRef = useRef(0);
  const pendingRef = useRef<unknown>(null);
  const introRef = useRef({
    active: false,
    startedAt: 0,
    fromPosition: [0, 0, 0] as CameraPosition,
    toPosition: [0, 0, 0] as CameraPosition,
    notified: false,
  });

  // Mouse tracking state
  const baseOrbitRef = useRef({ x: 0, y: 0, radius: 1 });
  const currentRotateRef = useRef({ x: 0, y: 0 });
  const targetRotateRef = useRef({ x: 0, y: 0 });
  const isUserInteractingRef = useRef(false);
  const maxDeltaDeg = 1;
  const rotationEpsilon = 0.001;
  const introDurationMs = 2500;
  const fitPadding = 1.05;
  const fallbackTarget = useMemo(
    (): CameraPosition => [getPrimaryCenterX(primaryColumnCount) - 1, 7, 0],
    [primaryColumnCount],
  );
  const target = fallbackTarget;
  const baseViewOffset = useMemo<CameraPosition>(() => {
    const defaultTarget: CameraPosition = [getPrimaryCenterX(8) - 1, 7, 0];
    return [
      -18.18 - defaultTarget[0],
      18.64 - defaultTarget[1],
      106.96 - defaultTarget[2],
    ];
  }, []);

  const previousTargetRef = useRef<CameraPosition | null>(null);
  const previousFitKeyRef = useRef<string | null>(null);
  const hasPrimedIntroCameraRef = useRef(false);
  const hasStartedCurrentIntroRef = useRef(false);

  const getTargetVector = useCallback(() => {
    const controlsTarget = controlsRef.current?.target;
    if (controlsTarget) return controlsTarget;
    return { x: target[0], y: target[1], z: target[2] };
  }, [target]);

  const syncBaseOrbitFromCamera = useCallback(() => {
    const targetVector = getTargetVector();
    const dx = camera.position.x - targetVector.x;
    const dy = camera.position.y - targetVector.y;
    const dz = camera.position.z - targetVector.z;
    const radius = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    const baseX = (Math.asin(clamp(dy / radius, -1, 1)) * 180) / Math.PI;
    const baseY = (Math.atan2(dx, dz) * 180) / Math.PI;

    baseOrbitRef.current = { x: baseX, y: baseY, radius };
    currentRotateRef.current = { x: 0, y: 0 };
    targetRotateRef.current = { x: 0, y: 0 };
  }, [camera, getTargetVector]);

  const queueReport = useCallback(() => {
    if (!onChange || !controlsRef.current) return;
    const target = controlsRef.current.target;
    // Snapshot current camera/target; overwritten if another change happens
    // before the next animation frame.
    pendingRef.current = {
      camera: {
        position: {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z,
        },
        zoom: camera.zoom,
      },
      target: { x: target.x, y: target.y, z: target.z },
    };
    // Coalesce rapid control events into a single report per frame.
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      if (!pendingRef.current) return;
      onChange(pendingRef.current);
      pendingRef.current = null;
    });
  }, [camera, onChange]);

  const handleChange = useCallback(() => {
    queueReport();
  }, [queueReport]);

  const applyOrbitCamera = useCallback(
    (orbitX, orbitY) => {
      const targetVector = getTargetVector();
      const { radius } = baseOrbitRef.current;
      const angleX = (orbitX * Math.PI) / 180;
      const angleY = (orbitY * Math.PI) / 180;
      const cosX = Math.cos(angleX);

      camera.position.x = targetVector.x + radius * Math.sin(angleY) * cosX;
      camera.position.y = targetVector.y + radius * Math.sin(angleX);
      camera.position.z = targetVector.z + radius * Math.cos(angleY) * cosX;
      camera.lookAt(targetVector.x, targetVector.y, targetVector.z);
      controlsRef.current?.update();
      queueReport();
    },
    [camera, getTargetVector, queueReport],
  );

  const applyTrackedCamera = useCallback(
    (offsetX, offsetY) => {
      const { x: baseX, y: baseY } = baseOrbitRef.current;
      applyOrbitCamera(baseX + offsetX, baseY + offsetY);
    },
    [applyOrbitCamera],
  );

  const applyCameraPosition = useCallback(
    (x, y, z) => {
      const targetVector = getTargetVector();
      camera.position.set(x, y, z);
      camera.lookAt(targetVector.x, targetVector.y, targetVector.z);
      controlsRef.current?.update();
      queueReport();
    },
    [camera, getTargetVector, queueReport],
  );

  const getFittedCameraPosition = useCallback(() => {
    if (!sceneBounds) return;
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    // Store camera as PerspectiveCamera to help TypeScript narrow the type
    const perspectiveCamera = camera as THREE.PerspectiveCamera;

    const framingTarget = new THREE.Vector3(...target);
    const desiredOffset = new THREE.Vector3(...baseViewOffset);
    const viewDirection = desiredOffset.clone().normalize();
    const forward = viewDirection.clone().multiplyScalar(-1);
    const worldUp = new THREE.Vector3(0, 1, 0);
    let right = new THREE.Vector3().crossVectors(forward, worldUp);

    if (right.lengthSq() < 1e-6) {
      right = new THREE.Vector3(1, 0, 0);
    } else {
      right.normalize();
    }

    const up = new THREE.Vector3().crossVectors(right, forward).normalize();
    const corners = getBoundsCorners(sceneBounds.center, sceneBounds.size);

    // Now we can safely call getEffectiveFOV on the perspectiveCamera
    const verticalFov = THREE.MathUtils.degToRad(
      perspectiveCamera.getEffectiveFOV(),
    );
    const aspect = size.height === 0 ? 1 : size.width / size.height;
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
    const tanVertical = Math.tan(verticalFov / 2);
    const tanHorizontal = Math.tan(horizontalFov / 2);

    let requiredDistance = 0;
    for (const corner of corners) {
      const relative = corner.clone().sub(framingTarget);
      const offsetX = Math.abs(relative.dot(right)) * fitPadding;
      const offsetY = Math.abs(relative.dot(up)) * fitPadding;
      const offsetZ = relative.dot(viewDirection);
      const distanceForWidth = offsetZ + offsetX / tanHorizontal;
      const distanceForHeight = offsetZ + offsetY / tanVertical;
      requiredDistance = Math.max(
        requiredDistance,
        distanceForWidth,
        distanceForHeight,
      );
    }

    return framingTarget
      .clone()
      .add(viewDirection.multiplyScalar(requiredDistance));
  }, [
    baseViewOffset,
    camera,
    fitPadding,
    sceneBounds,
    size.height,
    size.width,
    target,
  ]);

  const applyFittedCamera = useCallback(() => {
    const nextCameraPosition = getFittedCameraPosition();
    if (!nextCameraPosition) return;

    applyCameraPosition(
      nextCameraPosition.x,
      nextCameraPosition.y,
      nextCameraPosition.z,
    );
    syncBaseOrbitFromCamera();
  }, [applyCameraPosition, getFittedCameraPosition, syncBaseOrbitFromCamera]);

  const getIntroCameraPositions = useCallback(() => {
    const fittedPosition = getFittedCameraPosition();
    if (!fittedPosition) return null;

    const targetVector = new THREE.Vector3(...target);
    const fittedOffset = fittedPosition.clone().sub(targetVector);
    const introOffset = rotateOffset(fittedOffset, 6, 26);

    return {
      from: [
        targetVector.x + introOffset.x,
        targetVector.y + introOffset.y,
        targetVector.z + introOffset.z,
      ] as CameraPosition,
      to: [
        fittedPosition.x,
        fittedPosition.y,
        fittedPosition.z,
      ] as CameraPosition,
    };
  }, [getFittedCameraPosition, target]);

  useEffect(() => {
    // Push an initial report so the HUD has values on load.
    queueReport();
  }, [queueReport]);

  useLayoutEffect(() => {
    if (hasPrimedIntroCameraRef.current) return;

    const introPositions = getIntroCameraPositions();
    if (introPositions) {
      applyCameraPosition(...introPositions.from);
    }
    syncBaseOrbitFromCamera();
    hasPrimedIntroCameraRef.current = true;
  }, [applyCameraPosition, getIntroCameraPositions, syncBaseOrbitFromCamera]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const [nextX, nextY, nextZ] = target;
    const previousTarget = previousTargetRef.current;

    if (previousTarget) {
      const deltaX = nextX - previousTarget[0];
      const deltaY = nextY - previousTarget[1];
      const deltaZ = nextZ - previousTarget[2];
      camera.position.set(
        camera.position.x + deltaX,
        camera.position.y + deltaY,
        camera.position.z + deltaZ,
      );
    }

    controls.target.set(nextX, nextY, nextZ);
    camera.lookAt(nextX, nextY, nextZ);
    controls.update();

    previousTargetRef.current = [nextX, nextY, nextZ];
    syncBaseOrbitFromCamera();
    queueReport();
  }, [camera, queueReport, syncBaseOrbitFromCamera, target]);

  useEffect(() => {
    syncBaseOrbitFromCamera();
  }, [syncBaseOrbitFromCamera]);

  useEffect(() => {
    if (playIntroAnimation || !sceneBounds) return;
    const nextFitKey = JSON.stringify({
      sceneBounds,
      width: size.width,
      height: size.height,
    });

    if (previousFitKeyRef.current === nextFitKey) {
      return;
    }

    previousFitKeyRef.current = nextFitKey;
    applyFittedCamera();
  }, [
    applyFittedCamera,
    playIntroAnimation,
    sceneBounds,
    size.height,
    size.width,
  ]);

  useEffect(() => {
    if (!playIntroAnimation) {
      introRef.current.active = false;
      hasStartedCurrentIntroRef.current = false;
      return;
    }

    if (hasStartedCurrentIntroRef.current) return;

    // Only start the animation, don't reposition the camera
    // The camera is already at introStartPosition from useLayoutEffect
    const introPositions = getIntroCameraPositions();
    if (!introPositions) return;
    hasStartedCurrentIntroRef.current = true;

    introRef.current = {
      active: true,
      startedAt: performance.now(),
      fromPosition: introPositions.from,
      toPosition: introPositions.to,
      notified: false,
    };

    // Don't call applyCameraPosition here - camera is already positioned
    // This prevents the flicker from repositioning
  }, [getIntroCameraPositions, playIntroAnimation]);

  useEffect(() => {
    if (!isPointerInside) {
      targetRotateRef.current = { x: 0, y: 0 };
    }
  }, [isPointerInside]);

  useEffect(() => {
    return () => {
      // Avoid a queued callback running after unmount.
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, []);

  useFrame((_, delta) => {
    const intro = introRef.current;
    if (intro.active) {
      const elapsed = performance.now() - intro.startedAt;
      const progress = clamp(elapsed / introDurationMs, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const [fromX, fromY, fromZ] = intro.fromPosition;
      const [toX, toY, toZ] = intro.toPosition;
      const nextX = fromX + (toX - fromX) * eased;
      const nextY = fromY + (toY - fromY) * eased;
      const nextZ = fromZ + (toZ - fromZ) * eased;

      applyCameraPosition(nextX, nextY, nextZ);

      if (progress >= 1) {
        intro.active = false;
        if (!intro.notified) {
          intro.notified = true;
          applyFittedCamera();
          syncBaseOrbitFromCamera();
          onIntroAnimationComplete?.();
        }
      }
      return;
    }

    if (!enableMouseTracking || isUserInteractingRef.current) return;

    const current = currentRotateRef.current;
    targetRotateRef.current = isPointerInside
      ? {
          x: clamp(-pointer.y * maxDeltaDeg, -maxDeltaDeg, maxDeltaDeg),
          y: clamp(pointer.x * maxDeltaDeg, -maxDeltaDeg, maxDeltaDeg),
        }
      : { x: 0, y: 0 };
    const targetOffsets = targetRotateRef.current;
    const dx = targetOffsets.x - current.x;
    const dy = targetOffsets.y - current.y;

    if (Math.abs(dx) < rotationEpsilon && Math.abs(dy) < rotationEpsilon) {
      // Snap to exact target to avoid tiny endless updates.
      if (current.x !== targetOffsets.x || current.y !== targetOffsets.y) {
        currentRotateRef.current = {
          x: targetOffsets.x,
          y: targetOffsets.y,
        };
        applyTrackedCamera(targetOffsets.x, targetOffsets.y);
      }
      return;
    }

    const speed = 12;
    const alpha = 1 - Math.exp(-speed * delta);
    const nextX = current.x + dx * alpha;
    const nextY = current.y + dy * alpha;

    currentRotateRef.current = { x: nextX, y: nextY };
    applyTrackedCamera(nextX, nextY);
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={target}
      enableRotate={false}
      enablePan={false}
      enableZoom={false}
      onChange={handleChange}
      onStart={handleChange}
    />
  );
}

export default Controls;
