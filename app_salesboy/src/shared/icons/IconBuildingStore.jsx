import React from 'react';
import { Path } from 'react-native-svg';
import SvgIcon from './SvgIcon';

export default function IconBuildingStore(props) {
  return (
    <SvgIcon {...props}>
      <Path d="M3 21l18 0" />
      <Path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2 -4h14l2 4" />
      <Path d="M5 21l0 -10.15" />
      <Path d="M19 21l0 -10.15" />
      <Path d="M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4" />
    </SvgIcon>
  );
}
