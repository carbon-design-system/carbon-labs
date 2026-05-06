/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { memo, useEffect, useMemo, useState } from 'react';
import { Text, RoundedBox } from '@react-three/drei';
import { animated, useSpring } from '@react-spring/three';
import * as THREE from 'three';
import {
  ANIM_DURATION,
  ENTER_ANIM_DURATION,
  LABEL_FONT_SIZE,
  LABEL_FONT_URL,
} from '../../constants';
import { useCanvasTheme } from '../../themeContext';
import { getSceneColors } from '../../styles/themeTokens';

const AnimatedGroup = animated.group;
const AnimatedMesh = animated.mesh;
const AnimatedText = animated(Text);
const AnimatedMaterial = animated.meshBasicMaterial;
const AnimatedRoundedBox = animated(RoundedBox);

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const TITLE_CHAR_WIDTH_FACTOR = 0.58;
const TITLE_SIDE_CLEARANCE = 8;
const ELLIPSIS = '...';

/**
 * TextBracket Component
 * Renders a bracket with title and sub-sections below the infrastructure layer
 * Uses 3D meshes for lines and Text components for labels
 */
const TextBracketScene = memo(function TextBracketScene({
  position = [0, 0, 0],
  width = 10,
  title = '',
  sections = [],
  enterDelayMs = 0,
  color,
  backgroundColor,
  ...props
}) {
  const theme = useCanvasTheme();
  const sceneColors = getSceneColors(theme);

  const resolvedColor = color || sceneColors.textBracketTitle;
  const resolvedBackgroundColor =
    backgroundColor || sceneColors.textBracketBackground;
  const [hasEntered, setHasEntered] = useState(false);
  const [titleTextWidth, setTitleTextWidth] = useState(0);

  const lineColor = sceneColors.textBracketLine;
  const titleColor = resolvedColor;
  const sectionColor = sceneColors.textBracketSection;
  const bracketHeight = 0.4;
  const lineThickness = 0.1;
  const cornerRadius = lineThickness / 2;
  const titleFontSize = LABEL_FONT_SIZE;
  const sectionFontSize = LABEL_FONT_SIZE * 0.72;
  const titleOffset = 0.54;
  const sectionOffset = 1.25;
  const maxTitleWidth = Math.max(0.1, width - TITLE_SIDE_CLEARANCE);
  const estimatedCharWidth = titleFontSize * TITLE_CHAR_WIDTH_FACTOR;
  const maxTitleChars = Math.max(
    1,
    Math.floor(
      (maxTitleWidth - estimatedCharWidth * ELLIPSIS.length) /
        estimatedCharWidth
    )
  );
  const displayTitle =
    title.length > maxTitleChars
      ? `${title.slice(0, maxTitleChars).trimEnd()}${ELLIPSIS}`
      : title;
  const titleGapWidth =
    titleTextWidth > 0 ? titleTextWidth + 1.6 : width * 0.16;
  const maskWidth = titleGapWidth;
  const maskHeight = 1.3;
  const sectionText = sections.filter(Boolean).join(' | ');
  const segmentWidth = Math.max((width - titleGapWidth) / 2, 0);
  const renderOrder = 40;
  const lineYOffset = -0.65;

  // Create geometries
  const horizontalLineGeometry = useMemo(
    () => new THREE.PlaneGeometry(segmentWidth, lineThickness),
    [lineThickness, segmentWidth]
  );

  const verticalLineGeometry = useMemo(
    () => new THREE.PlaneGeometry(lineThickness, bracketHeight),
    [bracketHeight, lineThickness]
  );

  const cornerCircleGeometry = useMemo(
    () => new THREE.CircleGeometry(cornerRadius, 16),
    [cornerRadius]
  );

  const basePosition = useMemo(
    () => (position?.length === 3 ? position : [0, 0, 0]),
    [position]
  );

  const textDurationMs =
    (hasEntered ? ANIM_DURATION * 2.1 : ENTER_ANIM_DURATION * 1.35) * 1000;
  const lineDurationMs =
    (hasEntered ? ANIM_DURATION * 3.2 : ENTER_ANIM_DURATION * 2.5) * 1000;
  const lineLeadInMs = textDurationMs * 0.38;

  const textSpring = useSpring({
    from: { textOpacity: 0 },
    to: { textOpacity: 1 },
    delay: hasEntered ? 0 : enterDelayMs,
    config: {
      duration: textDurationMs,
      easing: easeInOutCubic,
    },
  });

  const lineSpring = useSpring({
    from: { lineOpacity: 0, lineProgress: 0 },
    to: { lineOpacity: 1, lineProgress: 1 },
    delay: hasEntered ? 0 : enterDelayMs + lineLeadInMs,
    config: {
      duration: lineDurationMs,
      easing: easeInOutCubic,
    },
  });

  useEffect(() => {
    if (hasEntered) return;

    const timer = window.setTimeout(() => {
      setHasEntered(true);
    }, enterDelayMs + Math.max(textDurationMs, lineLeadInMs + lineDurationMs));

    return () => window.clearTimeout(timer);
  }, [enterDelayMs, hasEntered, lineDurationMs, lineLeadInMs, textDurationMs]);

  const leftAnchorX = -titleGapWidth / 2;
  const rightAnchorX = titleGapWidth / 2;
  const titleY = -titleOffset - 0.2;
  const sectionY = titleY - sectionOffset;

  return (
    <AnimatedGroup {...props} position={basePosition}>
      <animated.group
        position={[leftAnchorX, lineYOffset, 0]}
        scale={lineSpring.lineProgress.to((value) => [value, 1, 1])}>
        <AnimatedMesh
          position={[-segmentWidth / 2, 0, 0]}
          geometry={horizontalLineGeometry}
          dispose={null}
          renderOrder={renderOrder}>
          <AnimatedMaterial
            color={lineColor}
            transparent
            opacity={lineSpring.lineOpacity}
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
        </AnimatedMesh>
        <AnimatedMesh
          position={[-segmentWidth, bracketHeight / 2, 0]}
          geometry={verticalLineGeometry}
          dispose={null}
          renderOrder={renderOrder}>
          <AnimatedMaterial
            color={lineColor}
            transparent
            opacity={lineSpring.lineOpacity}
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
        </AnimatedMesh>
        {/* Corner circle at the junction */}
        <AnimatedMesh
          position={[-segmentWidth, 0, 0.001]}
          geometry={cornerCircleGeometry}
          dispose={null}
          renderOrder={renderOrder}>
          <AnimatedMaterial
            color={lineColor}
            transparent
            opacity={lineSpring.lineOpacity}
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
        </AnimatedMesh>
      </animated.group>
      <animated.group
        position={[rightAnchorX, lineYOffset, 0]}
        scale={lineSpring.lineProgress.to((value) => [value, 1, 1])}>
        <AnimatedMesh
          position={[segmentWidth / 2, 0, 0]}
          geometry={horizontalLineGeometry}
          dispose={null}
          renderOrder={renderOrder}>
          <AnimatedMaterial
            color={lineColor}
            transparent
            opacity={lineSpring.lineOpacity}
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
        </AnimatedMesh>
        <AnimatedMesh
          position={[segmentWidth, bracketHeight / 2, 0]}
          geometry={verticalLineGeometry}
          dispose={null}
          renderOrder={renderOrder}>
          <AnimatedMaterial
            color={lineColor}
            transparent
            opacity={lineSpring.lineOpacity}
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
        </AnimatedMesh>
        {/* Corner circle at the junction */}
        <AnimatedMesh
          position={[segmentWidth, 0, 0.001]}
          geometry={cornerCircleGeometry}
          dispose={null}
          renderOrder={renderOrder}>
          <AnimatedMaterial
            color={lineColor}
            transparent
            opacity={lineSpring.lineOpacity}
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
        </AnimatedMesh>
      </animated.group>

      {title && theme === 'light' && (
        <AnimatedRoundedBox
          args={[maskWidth, maskHeight, 0.01]}
          smoothness={4}
          position={[0, titleY + 0.05, 0.01]}
          renderOrder={renderOrder + 1}>
          <AnimatedMaterial
            color={resolvedBackgroundColor}
            transparent
            opacity={textSpring.textOpacity}
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
        </AnimatedRoundedBox>
      )}

      {title && (
        <AnimatedText
          position={[0, titleY, 0.02]}
          fontSize={titleFontSize}
          font={LABEL_FONT_URL}
          color={titleColor}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          renderOrder={renderOrder + 2}
          material-transparent
          material-opacity={textSpring.textOpacity}
          material-depthTest={false}
          material-depthWrite={false}
          material-toneMapped={false}
          onSync={(textMesh) => {
            const bounds = textMesh.textRenderInfo?.blockBounds;
            if (!bounds) return;
            const nextWidth = bounds[2] - bounds[0];
            if (nextWidth > 0 && Math.abs(nextWidth - titleTextWidth) > 0.01) {
              setTitleTextWidth(nextWidth);
            }
          }}
          raycast={() => null}>
          {displayTitle}
        </AnimatedText>
      )}

      {sectionText && (
        <AnimatedText
          position={[0, sectionY, 0.02]}
          fontSize={sectionFontSize}
          font={LABEL_FONT_URL}
          maxWidth={width * 0.8}
          color={sectionColor}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          renderOrder={renderOrder + 2}
          material-transparent
          material-opacity={textSpring.textOpacity}
          material-depthTest={false}
          material-depthWrite={false}
          material-toneMapped={false}
          raycast={() => null}>
          {sectionText}
        </AnimatedText>
      )}
    </AnimatedGroup>
  );
});

export const LayoutTextBracket = TextBracketScene;

const TextBracket = memo(function TextBracket({ title = '', sections = [] }) {
  return <TextBracketScene title={title} sections={sections} />;
});

export default TextBracket;
