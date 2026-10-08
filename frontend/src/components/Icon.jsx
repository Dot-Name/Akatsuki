import { createElement } from 'react';

const paths = {
  arrowRight: 'M5 12h14m-6-6 6 6-6 6',
  arrowUpRight: 'M7 17 17 7M8 7h9v9',
  sparkles: ['m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z', 'm19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z'],
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'm6 6 12 12M18 6 6 18',
};

export default function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.8 }) {
  const path = paths[name];
  if (!path) return null;

  const segments = Array.isArray(path) ? path : [path];
  return createElement('svg', {
    'aria-hidden': true,
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    focusable: 'false',
  }, segments.map((d, index) => createElement('path', { d, key: index })));
}
