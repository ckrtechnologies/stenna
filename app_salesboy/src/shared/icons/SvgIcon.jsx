import React from 'react';
import Svg from 'react-native-svg';

export default function SvgIcon({
  size = 24,
  color = '#0F172A',
  strokeWidth = 2,
  children,
  style,
  ...props
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      {...props}
    >
      {children}
    </Svg>
  );
}
