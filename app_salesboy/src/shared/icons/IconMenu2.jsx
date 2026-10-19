import React from 'react';
import { Path } from 'react-native-svg';
import SvgIcon from './SvgIcon';

export default function IconMenu2(props) {
  return (
    <SvgIcon {...props}>
      <Path d="M4 6l16 0" />
      <Path d="M4 12l16 0" />
      <Path d="M4 18l16 0" />
    </SvgIcon>
  );
}
