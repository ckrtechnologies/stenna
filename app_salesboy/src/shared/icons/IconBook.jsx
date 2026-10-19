import React from 'react';
import { Path } from 'react-native-svg';
import SvgIcon from './SvgIcon';

export default function IconBook(props) {
  return (
    <SvgIcon {...props}>
      <Path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
      <Path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
      <Path d="M3 6l0 13" />
      <Path d="M12 6l0 13" />
      <Path d="M21 6l0 13" />
    </SvgIcon>
  );
}
