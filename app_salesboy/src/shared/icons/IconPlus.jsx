import React from 'react';
import { Path } from 'react-native-svg';
import SvgIcon from './SvgIcon';

export default function IconPlus(props) {
  return (
    <SvgIcon {...props}>
      <Path d="M12 5l0 14" />
      <Path d="M5 12l14 0" />
    </SvgIcon>
  );
}
