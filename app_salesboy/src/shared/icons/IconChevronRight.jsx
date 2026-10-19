import React from 'react';
import { Path } from 'react-native-svg';
import SvgIcon from './SvgIcon';

export default function IconChevronRight(props) {
  return (
    <SvgIcon {...props}>
      <Path d="M9 6l6 6l-6 6" />
    </SvgIcon>
  );
}
