import { isSafari } from 'uc-detective';

export const userScrollEvent = 'onwheel' in document.createElement('div') ? 'wheel' : // Modern browsers support 'wheel'
  document.onmousewheel !== undefined ? 'mousewheel' : // Webkit and IE support at least 'mousewheel'
  'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox

const windowScrollElement = isSafari ? document.body : document.documentElement;
export function getScrollableEl(el) {
  if (el === window || el === document.body || el === document.documentElement) {
    el = windowScrollElement;
  }

  return el
}
