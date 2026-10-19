import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useScreenEdges(edgesOverride, hasHeader, hasFooter) {
  const insets = useSafeAreaInsets();

  if (edgesOverride) {
    return {
      top: edgesOverride.includes('top') ? insets.top : 0,
      bottom: edgesOverride.includes('bottom') ? insets.bottom : 0,
      left: edgesOverride.includes('left') ? insets.left : 0,
      right: edgesOverride.includes('right') ? insets.right : 0,
      rawInsets: insets
    };
  }

  // Auto edges: if screen has custom header, header handles top inset.
  // If screen has sticky footer, footer handles bottom inset.
  return {
    top: hasHeader ? 0 : insets.top,
    bottom: hasFooter ? 0 : insets.bottom,
    left: insets.left,
    right: insets.right,
    rawInsets: insets
  };
}
