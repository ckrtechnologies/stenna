import React from 'react';
import { Path } from 'react-native-svg';
import SvgIcon from './SvgIcon';

export default function IconRefresh(props) {
  return (
    <SvgIcon {...props}>
      <Path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
      <Path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
    </SvgIcon>
  );
}
