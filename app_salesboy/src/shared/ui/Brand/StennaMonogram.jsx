import React from 'react';
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function StennaMonogram({ size = 32, gold = true, style }) {
  const primaryColor = gold ? '#D4AF37' : '#FFFFFF';
  const secondaryColor = gold ? '#F3E5AB' : '#E2E8F0';

  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={style}>
      <Defs>
        <LinearGradient id="stennaGoldGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <Stop stopColor={primaryColor} />
          <Stop offset="1" stopColor={secondaryColor} />
        </LinearGradient>
      </Defs>
      {/* Outer rounded diamond shield */}
      <Rect
        x="20"
        y="2"
        width="25.4"
        height="25.4"
        rx="4"
        transform="rotate(45 20 2)"
        stroke="url(#stennaGoldGrad)"
        strokeWidth="2.5"
        fill="rgba(212, 175, 55, 0.08)"
      />
      {/* Inner Stylized Geometric 'S' Monograph */}
      <Path
        d="M24 13h-6a3 3 0 0 0 -3 3v0a3 3 0 0 0 3 3h4a3 3 0 0 1 3 3v0a3 3 0 0 1 -3 3h-6"
        stroke="url(#stennaGoldGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
