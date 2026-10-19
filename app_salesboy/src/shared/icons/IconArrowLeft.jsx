import React from 'react';
import { Path } from 'react-native-svg';
import SvgIcon from './SvgIcon';

export default function IconArrowLeft(props) {
  return (
    <SvgIcon {...props}>
      <Path d="M5 12l14 0" />
      <Path d="M5 12l6 6" />
      <Path d="M5 12l6 -6" />
    </SvgIcon>
  );
}
