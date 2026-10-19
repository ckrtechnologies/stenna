import React from 'react';
import { Path } from 'react-native-svg';
import SvgIcon from './SvgIcon';

export default function IconCheck(props) {
  return (
    <SvgIcon {...props}>
      <Path d="M5 12l5 5l10 -10" />
    </SvgIcon>
  );
}
