import { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import Svg, { Rect as SvgRect, Circle as SvgCircle } from "react-native-svg";

type WaveformRecorderProps = {
  points: number[];
  elapsed: string;
  title?: string;
  width: number;
  height?: number;
  barColor?: string;
  playheadColor?: string;
};

const BAR_W = 3;
const GAP = 2;
const STEP = BAR_W + GAP;
const MAX_HISTORY = 400;
const PLAYHEAD_RATIO = 0.68;

export function WaveformRecorder({
  points,
  elapsed,
  title = "Live",
  width,
  height = 100,
  barColor = "#ffffff",
  playheadColor = "#e53935",
}: WaveformRecorderProps) {
  const barsRef = useRef<number[]>([]);
  const [, forceUpdate] = useState(0); // ✅ triggers SVG redraw on each frame

  useEffect(() => {
    if (points.length === 0) return;

    const rms = Math.sqrt(
      points.reduce((s, v) => s + v * v, 0) / points.length,
    );
    const normalised = Math.min(rms / 0.05, 1);
    barsRef.current.push(normalised);
    if (barsRef.current.length > MAX_HISTORY) barsRef.current.shift();

    forceUpdate((n) => n + 1); // ✅ re-render SVG with new bar
  }, [points]);

  const midY = height / 2;
  const svgWidth = width - 32; // account for card padding
  const playheadX = Math.floor(svgWidth * PLAYHEAD_RATIO);
  const maxBarsLeft = Math.floor(playheadX / STEP);
  const recentBars = barsRef.current.slice(-maxBarsLeft);

  const pastBars = recentBars
    .map((h, i) => {
      const x = playheadX - (recentBars.length - i) * STEP;
      const barH = Math.max(4, h * (height - 16) * 0.9);
      return { x, y: midY - barH / 2, h: barH };
    })
    .filter((b) => b.x >= 0);

  const dotCount = Math.floor((svgWidth - playheadX - 12) / STEP);
  const dots = Array.from({ length: dotCount }, (_, i) => ({
    cx: playheadX + 12 + i * STEP + BAR_W / 2,
    cy: midY,
  }));

  return (
    <View
      style={{
        backgroundColor: "#181b2e",
        borderRadius: 20,
        padding: 16,
        width,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: "#fff",
            fontSize: 13,
            fontWeight: "600",
            letterSpacing: 1,
            fontVariant: ["tabular-nums"],
          }}
        >
          {elapsed}
        </Text>
      </View>

      {/* Waveform SVG */}
      <Svg width={svgWidth} height={height}>
        {/* Past bars */}
        {pastBars.map((b, i) => (
          <SvgRect
            key={i}
            x={b.x}
            y={b.y}
            width={BAR_W}
            height={b.h}
            rx={1}
            fill={barColor}
            opacity={0.85}
          />
        ))}

        {/* Future dots */}
        {dots.map((d, i) => (
          <SvgCircle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={1.5}
            fill="rgba(255,255,255,0.18)"
          />
        ))}

        {/* Playhead */}
        <SvgRect
          x={playheadX}
          y={0}
          width={2}
          height={height}
          rx={1}
          fill={playheadColor}
        />
      </Svg>
    </View>
  );
}
