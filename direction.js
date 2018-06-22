import { direction } from './engine';
import { getScrollableEl } from './util';

export default function scrollDirection(el, options, cb) {
  el = getScrollableEl(el);
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  return direction(el, {
    d: options.direction ? options.direction[0] : 'v',
    t: options.threshold || 0,
    cb: cb
  });
}
