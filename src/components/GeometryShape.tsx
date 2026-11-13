import React, { useMemo } from 'react';
import { ShapeKind } from '../types/game';

interface GeometryShapeProps {
  kind: ShapeKind;
  color: string;
  rotationDeg?: number;
  scale?: number;
  lean?: 1 | -1;
  aspectRatio?: number;
  showMarkers?: boolean;
  highlightGreen?: boolean;
  className?: string;
}

interface Point {
  x: number;
  y: number;
}

function darkenHex(hex: string, amount = 0.25): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#183B70';
  const r = Math.max(0, Math.round(parseInt(clean.slice(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(clean.slice(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(clean.slice(4, 6), 16) * (1 - amount)));
  return `rgb(${r}, ${g}, ${b})`;
}

function lightenHex(hex: string, amount = 0.28): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#FFFFFF';
  const r = Math.min(255, Math.round(parseInt(clean.slice(0, 2), 16) + (255 - parseInt(clean.slice(0, 2), 16)) * amount));
  const g = Math.min(255, Math.round(parseInt(clean.slice(2, 4), 16) + (255 - parseInt(clean.slice(2, 4), 16)) * amount));
  const b = Math.min(255, Math.round(parseInt(clean.slice(4, 6), 16) + (255 - parseInt(clean.slice(4, 6), 16)) * amount));
  return `rgb(${r}, ${g}, ${b})`;
}

function centerPoints(pts: Point[], cx = 100, cy = 80): Point[] {
  const avgX = pts.reduce((sum, p) => sum + p.x, 0) / pts.length;
  const avgY = pts.reduce((sum, p) => sum + p.y, 0) / pts.length;
  return pts.map((p) => ({ x: p.x - avgX + cx, y: p.y - avgY + cy }));
}

function renderTickOnEdge(p1: Point, p2: Point, count: 1 | 2, stroke = '#183B70') {
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // Normal unit vector
  const nx = -uy;
  const ny = ux;
  const tickHalf = 6;

  if (count === 1) {
    return (
      <line
        x1={mx - nx * tickHalf}
        y1={my - ny * tickHalf}
        x2={mx + nx * tickHalf}
        y2={my + ny * tickHalf}
        stroke={stroke}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    );
  }
  const offset = 3.5;
  return (
    <g>
      <line
        x1={mx - ux * offset - nx * tickHalf}
        y1={my - uy * offset - ny * tickHalf}
        x2={mx - ux * offset + nx * tickHalf}
        y2={my - uy * offset + ny * tickHalf}
        stroke={stroke}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <line
        x1={mx + ux * offset - nx * tickHalf}
        y1={my + uy * offset - ny * tickHalf}
        x2={mx + ux * offset + nx * tickHalf}
        y2={my + uy * offset + ny * tickHalf}
        stroke={stroke}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </g>
  );
}

function renderParallelArrow(p1: Point, p2: Point, count: 1 | 2, stroke = '#FFFFFF') {
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;

  const drawChevron = (cx: number, cy: number) => {
    const back = 5.5;
    const spread = 4.5;
    return (
      <polyline
        points={`${cx - ux * back + nx * spread},${cy - uy * back + ny * spread} ${cx + ux * 2},${cy + uy * 2} ${cx - ux * back - nx * spread},${cy - uy * back - ny * spread}`}
        fill="none"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  if (count === 1) {
    return drawChevron(mx + ux * 10, my + uy * 10);
  }
  return (
    <g>
      {drawChevron(mx - ux * 12, my - uy * 12)}
      {drawChevron(mx - ux * 5, my - uy * 5)}
    </g>
  );
}

export const GeometryShape: React.FC<GeometryShapeProps> = ({
  kind,
  color,
  rotationDeg = 0,
  scale = 1,
  lean = 1,
  aspectRatio = 1,
  showMarkers = false,
  highlightGreen = false,
  className = 'w-full h-full',
}) => {
  const uid = React.useId().replace(/:/g, '');
  const fillCol = highlightGreen ? '#54C98A' : color;
  const darkShade = darkenHex(fillCol, 0.28);
  const lightTint = lightenHex(fillCol, 0.35);

  const vertices = useMemo<Point[]>(() => {
    switch (kind) {
      case 'parallelogram': {
        // Distinct base vs side lengths so it is never confused with a rhombus
        const w = 104 * Math.max(0.85, Math.min(1.18, aspectRatio));
        const s = 62;
        const theta = (56 * Math.PI) / 180;
        const dx = s * Math.cos(theta);
        const dy = s * Math.sin(theta);
        const raw: Point[] =
          lean === 1
            ? [
                { x: dx, y: 0 },
                { x: w + dx, y: 0 },
                { x: w, y: dy },
                { x: 0, y: dy },
              ]
            : [
                { x: 0, y: 0 },
                { x: w, y: 0 },
                { x: w + dx, y: dy },
                { x: dx, y: dy },
              ];
        return centerPoints(raw, 100, 80);
      }
      case 'rhombus': {
        // All 4 sides strictly equal length a
        const a = 60;
        const alphaDeg = aspectRatio < 1 ? 54 : 64;
        const alpha = (alphaDeg * Math.PI) / 180;
        const rx = a * Math.cos(alpha / 2);
        const ry = a * Math.sin(alpha / 2);
        return [
          { x: 100, y: 80 - ry },
          { x: 100 + rx, y: 80 },
          { x: 100, y: 80 + ry },
          { x: 100 - rx, y: 80 },
        ];
      }
      case 'rectangle': {
        const w = 108;
        const h = 62;
        return [
          { x: 100 - w / 2, y: 80 - h / 2 },
          { x: 100 + w / 2, y: 80 - h / 2 },
          { x: 100 + w / 2, y: 80 + h / 2 },
          { x: 100 - w / 2, y: 80 + h / 2 },
        ];
      }
      case 'trapezoid': {
        // Strictly 1 pair of parallel sides (top != bottom)
        const tw = 56;
        const bw = 116;
        const h = 64;
        return centerPoints(
          [
            { x: (bw - tw) / 2, y: 0 },
            { x: (bw + tw) / 2, y: 0 },
            { x: bw, y: h },
            { x: 0, y: h },
          ],
          100,
          80
        );
      }
      case 'triangle': {
        const r = 56;
        return centerPoints(
          [
            { x: 0, y: -r },
            { x: r * 0.92, y: r * 0.72 },
            { x: -r * 0.92, y: r * 0.72 },
          ],
          100,
          80
        );
      }
      case 'pentagon': {
        const r = 52;
        const pts: Point[] = [];
        for (let i = 0; i < 5; i++) {
          const ang = (-90 + i * 72) * (Math.PI / 180);
          pts.push({ x: 100 + r * Math.cos(ang), y: 80 + r * Math.sin(ang) });
        }
        return pts;
      }
    }
  }, [kind, lean, aspectRatio]);

  const pointsAttr = vertices.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  const clampedScale = Math.max(0.7, Math.min(1.15, scale));

  return (
    <svg
      viewBox="0 0 200 160"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={lightTint} />
          <stop offset="45%" stopColor={fillCol} />
          <stop offset="100%" stopColor={darkShade} />
        </linearGradient>
        <filter id={`shadow-${uid}`} x="-15%" y="-15%" width="130%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#183B70" floodOpacity="0.22" />
        </filter>
      </defs>

      <g
        transform={`translate(100, 80) rotate(${rotationDeg}) scale(${clampedScale}) translate(-100, -80)`}
      >
        {/* Subtle 3D toy-block base depth */}
        <polygon
          points={pointsAttr}
          transform="translate(0, 5)"
          fill={darkShade}
          stroke={darkShade}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Primary mathematically exact polygon */}
        <polygon
          points={pointsAttr}
          fill={`url(#grad-${uid})`}
          stroke="#183B70"
          strokeWidth="3.2"
          strokeLinejoin="round"
          filter={`url(#shadow-${uid})`}
        />

        {/* Glossy inner highlight edge */}
        <polygon
          points={pointsAttr}
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* Mathematical property markers for Knowledge & Hints */}
        {showMarkers && kind === 'parallelogram' && (
          <g>
            {renderTickOnEdge(vertices[0], vertices[1], 2)}
            {renderTickOnEdge(vertices[2], vertices[3], 2)}
            {renderTickOnEdge(vertices[1], vertices[2], 1)}
            {renderTickOnEdge(vertices[3], vertices[0], 1)}
            {renderParallelArrow(vertices[0], vertices[1], 1)}
            {renderParallelArrow(vertices[3], vertices[2], 1)}
            {renderParallelArrow(vertices[3], vertices[0], 2)}
            {renderParallelArrow(vertices[2], vertices[1], 2)}
          </g>
        )}

        {showMarkers && kind === 'rhombus' && (
          <g>
            {renderTickOnEdge(vertices[0], vertices[1], 1)}
            {renderTickOnEdge(vertices[1], vertices[2], 1)}
            {renderTickOnEdge(vertices[2], vertices[3], 1)}
            {renderTickOnEdge(vertices[3], vertices[0], 1)}
            {renderParallelArrow(vertices[0], vertices[1], 1)}
            {renderParallelArrow(vertices[3], vertices[2], 1)}
          </g>
        )}

        {showMarkers && kind === 'rectangle' && (
          <g>
            <rect
              x={vertices[0].x}
              y={vertices[0].y}
              width="12"
              height="12"
              fill="none"
              stroke="#183B70"
              strokeWidth="2.2"
            />
            <rect
              x={vertices[1].x - 12}
              y={vertices[1].y}
              width="12"
              height="12"
              fill="none"
              stroke="#183B70"
              strokeWidth="2.2"
            />
          </g>
        )}

        {/* Vertex pins for geometric clarity */}
        {showMarkers &&
          vertices.map((v, idx) => (
            <circle
              key={idx}
              cx={v.x}
              cy={v.y}
              r="4.2"
              fill="#FFD447"
              stroke="#183B70"
              strokeWidth="2"
            />
          ))}
      </g>
    </svg>
  );
};
