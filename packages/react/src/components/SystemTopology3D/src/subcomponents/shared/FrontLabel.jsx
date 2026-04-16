import React, { memo, useEffect, useMemo, useState } from 'react';
import { Text } from '@react-three/drei';
import { animated, useSpring } from '@react-spring/three';
import {
  LABEL_FONT_SIZE,
  LABEL_PADDING,
  LABEL_FONT_URL,
} from '../../constants';

const AnimatedText = animated(Text);
const ELLIPSIS = '...';
const VISIBLE_LABEL_Z_OFFSET = 0.09;
const LABEL_FIT_SAFETY_MARGIN = 0.15;
const MEASUREMENT_FONT_PX = 100;

let measurementCanvas;
let measurementContext;
let fontLoadPromise;

function formatLabelValue(source, visibleChars) {
  if (!source) return '';
  if (visibleChars >= source.length) return source;
  return `${source.slice(0, visibleChars).trimEnd()}${ELLIPSIS}`;
}

function getMeasurementContext() {
  if (!measurementCanvas) {
    measurementCanvas = document.createElement('canvas');
    measurementContext = measurementCanvas.getContext('2d');
  }
  return measurementContext;
}

async function ensureMeasurementFont() {
  if (typeof document === 'undefined') return;
  if (!fontLoadPromise) {
    fontLoadPromise = (async () => {
      try {
        const font = new FontFace('IBMPlexSans', `url(${LABEL_FONT_URL})`);
        await font.load();
        document.fonts.add(font);
      } catch (error) {
        console.warn('Failed to load font for measurement:', error);
      }
    })();
  }
  await fontLoadPromise;
}

const EllipsizedLabel = memo(function EllipsizedLabel({
  text,
  width,
  height,
  depth,
  color,
  renderOrder,
  opacity,
}) {
  const maxLabelWidth = Math.max(
    0.1,
    width - LABEL_PADDING * 2 - LABEL_FIT_SAFETY_MARGIN
  );
  const labelPosition = useMemo(
    () => [-width / 2 + LABEL_PADDING, height / 2 - LABEL_PADDING, depth / 2],
    [depth, height, width]
  );
  const [displayText, setDisplayText] = useState(text || '');

  useEffect(() => {
    let cancelled = false;

    async function measureAndTrim() {
      if (!text) {
        if (!cancelled) setDisplayText('');
        return;
      }

      await ensureMeasurementFont();
      if (cancelled) return;

      const context = getMeasurementContext();
      if (!context) {
        if (!cancelled) setDisplayText(text);
        return;
      }

      context.font = `600 ${MEASUREMENT_FONT_PX}px "CanvasLabelFont"`;
      const maxLabelWidthPx =
        (maxLabelWidth / LABEL_FONT_SIZE) * MEASUREMENT_FONT_PX;

      let nextDisplayText = ELLIPSIS;

      for (
        let visibleChars = text.length;
        visibleChars >= 0;
        visibleChars -= 1
      ) {
        const candidate = formatLabelValue(text, visibleChars);
        const measuredWidthPx = context.measureText(candidate).width;
        if (measuredWidthPx <= maxLabelWidthPx) {
          nextDisplayText = candidate;
          break;
        }
      }

      if (!cancelled) {
        setDisplayText(nextDisplayText);
      }
    }

    measureAndTrim();

    return () => {
      cancelled = true;
    };
  }, [maxLabelWidth, text]);

  if (!text) return null;

  return (
    <AnimatedText
      position={[
        labelPosition[0],
        labelPosition[1],
        labelPosition[2] + VISIBLE_LABEL_Z_OFFSET,
      ]}
      fontSize={LABEL_FONT_SIZE}
      font={LABEL_FONT_URL}
      color={color}
      textAlign="left"
      anchorX="left"
      anchorY="top"
      whiteSpace="nowrap"
      renderOrder={renderOrder}
      depthOffset={-1}
      material-transparent
      material-opacity={opacity}
      material-depthTest
      material-depthWrite={false}
      outlineWidth={0}
      sdfGlyphSize={512}
      material-toneMapped={false}
      raycast={() => null}>
      {displayText}
    </AnimatedText>
  );
});

const FrontLabel = memo(function FrontLabel({
  text,
  hoverText,
  width,
  height,
  depth,
  opacity = 1,
  isHovered = false,
  textColor = '#ffffff',
  renderOrder,
}) {
  const labelSpring = useSpring({
    labelOpacity: isHovered ? 0 : opacity,
    hoverLabelOpacity: isHovered ? opacity : 0,
    config: { tension: 300, friction: 30 },
  });

  if (!text && !hoverText) return null;

  return (
    <>
      <EllipsizedLabel
        key={`base:${text}:${width}:${height}:${depth}`}
        text={text}
        width={width}
        height={height}
        depth={depth}
        color={textColor}
        renderOrder={renderOrder}
        opacity={labelSpring.labelOpacity}
      />
      <EllipsizedLabel
        key={`hover:${hoverText}:${width}:${height}:${depth}`}
        text={hoverText}
        width={width}
        height={height}
        depth={depth}
        color={textColor}
        renderOrder={renderOrder}
        opacity={labelSpring.hoverLabelOpacity}
      />
    </>
  );
});

export default FrontLabel;
