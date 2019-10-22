import { browser } from 'uc-detective';

const fix = browser.name === 'safari' && browser.version < 13

export const userScrollEvent = 'onwheel' in document.createElement('div') ? 'wheel' : // Modern browsers support 'wheel'
  document.onmousewheel !== undefined ? 'mousewheel' : // Webkit and IE support at least 'mousewheel'
  'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox

const windowScrollElement = fix ? document.body : document.documentElement;
export function getScrollableEl(el) {
  if (el === window || el === document.body || el === document.documentElement) {
    return windowScrollElement;
  }

  return el
}
