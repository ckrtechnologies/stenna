import React from 'react';
import { Path } from 'react-native-svg';
import SvgIcon from './SvgIcon';

export default function IconLock(props) {
  return (
    <SvgIcon {...props}>
      <Path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z" />
      <Path d="M8 11v-4a4 4 0 1 1 8 0v4" />
    </SvgIcon>
  );
}
