import { to } from './engine';
import { getScrollableEl } from './util';

export default function scrollTo(el, options, cb) {
  el = getScrollableEl(el);

  const target = {};
  let toEl = options.to;
  const direction = options.direction || 'vertical';

  if (typeof toEl === 'string') {
    toEl = el.querySelector(toEl);
    if (!toEl) {
      return false;
    }
  }

  if (toEl instanceof Element) {
    const pos = toEl.getBoundingClientRect();
    toEl = {
      top: pos.top,
      left: pos.left
    };
  } else {
    toEl.top -= el.scrollTop;
    toEl.left -= el.scrollLeft;
  }

  if (direction === 'vertical' || direction === 'both') {
    const topChange = toEl.top + (options.shiftTop || 0);
    if (topChange !== 0) {
      target.scrollTop = topChange;
    }
  }

  if (direction === 'horizontal' || direction === 'both') {
    const leftChange = toEl.left + (options.shiftLeft || 0);
    if (leftChange !== 0) {
      target.scrollLeft = leftChange;
    }
  }

  if (Object.keys(target).length) {
    return to(el, {
      a: target,
      duration: options.duration || 1000,
      ease: options.ease || 'linear',
      cb: cb
    });
  }
};
