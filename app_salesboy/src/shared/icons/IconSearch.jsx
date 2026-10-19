import React from 'react';
import { Path } from 'react-native-svg';
import SvgIcon from './SvgIcon';

export default function IconSearch(props) {
  return (
    <SvgIcon {...props}>
      <Path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
      <Path d="M21 21l-6 -6" />
    </SvgIcon>
  );
}
