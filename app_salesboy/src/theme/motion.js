export const motion = {
  durations: {
    instant: 0,
    fast: 150,
    base: 250,
    slow: 350
  },
  easings: {
    standard: [0.2, 0, 0, 1],
    accelerate: [0.3, 0, 1, 1],
    decelerate: [0, 0, 0, 1]
  },
  presets: {
    'screen-push': {
      animation: 'slide_from_right'
    },
    'modal-present': {
      animation: 'slide_from_bottom',
      presentation: 'modal'
    },
    'press-scale': {
      scale: 0.97,
      duration: 100
    },
    'badge-bump': {
      peakScale: 1.15,
      duration: 180
    },
    'list-stagger': {
      stepDelay: 35,
      itemDuration: 200
    }
  }
};
