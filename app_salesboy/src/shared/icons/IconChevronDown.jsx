import React from 'react';
import { Path } from 'react-native-svg';
import SvgIcon from './SvgIcon';

export default function IconChevronDown(props) {
  return (
    <SvgIcon {...props}>
      <Path d="M6 9l6 6l6 -6" />
    </SvgIcon>
  );
}
