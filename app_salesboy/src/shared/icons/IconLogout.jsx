import React from 'react';
import { Path } from 'react-native-svg';
import SvgIcon from './SvgIcon';

export default function IconLogout(props) {
  return (
    <SvgIcon {...props}>
      <Path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
      <Path d="M9 12h12l-3 -3" />
      <Path d="M18 15l3 -3" />
    </SvgIcon>
  );
}
