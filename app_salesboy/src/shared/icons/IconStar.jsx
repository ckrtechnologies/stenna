import React from 'react';
import { Path } from 'react-native-svg';
import SvgIcon from './SvgIcon';

export default function IconStar({ fill = 'none', ...props }) {
  return (
    <SvgIcon {...props}>
      <Path
        fill={fill}
        d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"
      />
    </SvgIcon>
  );
}
