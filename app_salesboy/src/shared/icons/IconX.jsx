import React from 'react';
import { Path } from 'react-native-svg';
import SvgIcon from './SvgIcon';

export default function IconX(props) {
  return (
    <SvgIcon {...props}>
      <Path d="M18 6l-12 12" />
      <Path d="M6 6l12 12" />
    </SvgIcon>
  );
}
