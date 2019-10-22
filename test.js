import { ready, get, on } from 'uc-dom'
import scroll from './index'

ready(() => {
  const elHeader = get('header').item(0)
  on(elHeader, 'click', 'a', e => {
    e.preventDefault();
    scroll.to(window, {
      to: e.target.hash,
      ease: 'inOutExpo',
      duration: 1500
    });
  });

  const elScroll = get('#scroll');
  const elContent = get('#content');
  on(elContent, 'click', 'a.child', e => {
    e.preventDefault();
    scroll.to(elScroll, {
      to: { top: 200, left: 50 },
      direction: 'both',
      shiftTop: 50,
      ease: 'inOutExpo'
    }, () => console.log('done'));
  });

  scroll.on(window, {
    on: '#content',
    condition: 'top(20) and bottom(-20)'
  }, (condition, event) => {
    event.target.style.background = condition ? '#006600' : '#660000';
  });

  scroll.on(elScroll, {
    on: '#rollon',
    condition: 'middle'
  }, (condition, event) => {
    console.log('box', condition);
    event.target.style.background = condition ? '#006600' : '#660000';
  });

  scroll.direction(window, cond => {
    console.log('direction', cond)
  });
});
