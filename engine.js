import { requestAnimationFrame as rAF, isTouch } from 'uc-detective';
import { on as eOn, off as eOff } from 'uc-dom';
import * as easing from './easing';
import { userScrollEvent } from './util';

let queueIndex = 0;
let queueLength = 0;
const queue = {};
const documentElement = document.documentElement;

//handling window resize
let windowResized = true;
let wHeight;
let wWidth;

const onWindowResize = eOn(window, 'resize', () => {
  windowResized = true;
});

//calc engine
const engine = function() {
  if (windowResized) {
    wHeight = Math.max(documentElement.clientHeight, window.innerHeight || 0);
    wWidth = Math.max(documentElement.clientWidth, window.innerWidth || 0);
  }

  for (const i in queue) {
    const frame = queue[i];
    (frame.toUpdate || windowResized) && frame.calc();
  }

  windowResized = false;
  queueLength && rAF(engine);
};

//calcs
const calcs = {
  to: function() {
    const el = this.el;
    const a = this.a;
    let time = Date.now() - this.begin;

    if (time > this.duration) {
      time = this.duration;
      this.stop();
    }

    for (const prop in a) {
      el[prop] = this.ease(time, a[prop].b, a[prop].c, this.duration);
    }
  },

  on: function() {
    const el = this.el;
    const conditionsArray = this.c;
    const posEl = el.getBoundingClientRect();

    for (const i in conditionsArray) {
      const conditionsItem = conditionsArray[i];
      const conditions = conditionsItem.c;
      const targets = conditionsItem.on;

      for (let t = 0, l = targets.length; t < l; t++) {
        const target = targets[t];
        const result = { target: target };
        const posTarget = target.getBoundingClientRect();
        const isSelf = (el === target);
        let newValue;
        let elProp;
        let targetProp;

        //cleanup cache
        this.current = {};

        for (const c in conditions) {
          const conds = conditions[c];
          newValue = true;

          for (const j in conds) {
            elProp = Object.keys(conds[j])[0];
            targetProp = conds[j][elProp][0];
            const value = conds[j][elProp][1];

            const current = this.getPos(elProp + targetProp, isSelf, posEl, posTarget);
            if ((elProp === 'top' || elProp === 'left') ? (current < value) : (current > value)) {
              newValue = false;
              break;
            }
          }

          if (newValue === true) {
            break;
          }
        }

        const currentState = target.getAttribute('data-scrollon-state-' + i);
        if (!currentState || (currentState === 'true') !== newValue) {
          target.setAttribute('data-scrollon-state-' + i, newValue);
          result[elProp] = targetProp;
          conditionsItem.cb(newValue, result);
        }
      }
    }

    this.toUpdate = false;
  },

  direction: function() {
    const top = this.top - this.el.scrollTop;
    const left = this.left - this.el.scrollLeft;
    const absTop = Math.abs(top);
    const absLeft = Math.abs(left);
    const conditionsArray = this.c;
    let dir;

    for (const c in conditionsArray) {
      const cond = conditionsArray[c];

      if (cond.d === 'v' && absTop > cond.t) {
        dir = top < 0;
        if (this.vertical !== dir) {
          this.vertical = dir;
          cond.cb(this.vertical);
        }
      } else if (cond.d === 'h' && absLeft > cond.t) {
        dir = left < 0;
        if (this.horizontal !== dir) {
          this.horizontal = dir;
          cond.cb(this.horizontal);
        }
      }
    }

    this.top = this.el.scrollTop;
    this.left = this.el.scrollLeft;
    this.toUpdate = false;
  }
};

//animation frame class
const RollFrame = function(el, type, options) {
  this.el = el;
  this.isWindow = (el === document.body || el === documentElement);
  this.type = type;
  this.calc = calcs[type];

  switch (type) {
    case 'to':
      this.duration = options.duration;
      this.ease = easing[options.ease];
      this.cb = options.cb;
      this.a = {}; //animation properties

      for (const prop in options.a) {
        this.a[prop] = {
          b: el[prop], // begin value
          c: options.a[prop] // change value
        };
      }

      this.onScroll = eOn(el, userScrollEvent, () => {
        this.stop();
        eOff(el, userScrollEvent, this.onScroll);
      });

      this.begin = Date.now();
      this.toUpdate = true;
      break;

    case 'direction':
      this.top = el.scrollTop;
      this.left = el.scrollLeft;

      this.onScroll = eOn(el, userScrollEvent, () => {
        this.toUpdate = true;
      });
      isTouch && eOn(el, 'touchmove', this.onScroll);
      this.c = [];
      this.add(options);
      break;

    case 'on':
      this.onScroll = eOn(this.isWindow ? window : el, 'scroll', () => {
        this.toUpdate = true;
      });

      this.c = [];
      this.add(options);
      break;
  }

  this.start();
};

RollFrame.prototype = {
  add: function(conditions) {
    this.c.push(conditions);
    this.update();
  },

  start: function() {
    this.id = queueIndex++;
    this.el.setAttribute('data-' + this.type, this.id);
    queue[this.id] = this;
    ++queueLength === 1 && engine();
  },

  stop: function() {
    if (this.a) {
      eOff(this.el, userScrollEvent, this.onScroll);
    } else {
      eOff(window, 'resize', this.onScroll);
      eOff(window, 'scroll', this.onScroll);
      eOff(window, 'touchmove', this.onScroll);
      eOff(this.el, 'scroll', this.onScroll);
      this.el.removeAttribute('data-scrollon-state');
    }

    this.el.removeAttribute('data-' + this.type);

    if (queue[this.id]) {
      delete queue[this.id];
      queueLength--;
      this.cb && this.done();
    }
  },

  done: function() {
    setTimeout(() => this.cb(this.el), 0);
  },

  update: function() {
    const conditions = this.c;
    for (const i in conditions) {
      const c = conditions[i];
      if (c.selector) {
        c.on = this.el.querySelectorAll(c.selector);
      }
    }
    this.toUpdate = true;
  },

  getPos: function(name, isSelf, posEl, posTarget) {
    if (!this.current[name]) {
      this.current[name] = positions[name].call(this, isSelf, posEl, posTarget);
    }

    return this.current[name];
  }
};

const positions = {
  toptop:       function(isSelf, e, t) { return this.isWindow ? t.top : isSelf ? this.el.scrollTop : t.top - e.top; },
  topmiddle:    function(isSelf, e, t) { return this.getPos('toptop', isSelf, e, t) + t.height / 2; },
  topbottom:    function(isSelf, e, t) { return this.isWindow ? t.bottom : t.bottom - e.top; },

  middletop:    function(isSelf, e, t) { return this.getPos('toptop', isSelf, e, t) - (this.isWindow ? wHeight / 2 : e.height / 2); },
  middlemiddle: function(isSelf, e, t) { return this.getPos('middletop', isSelf, e, t) + t.height / 2; },
  middlebottom: function(isSelf, e, t) { return -this.getPos('bottombottom', isSelf, e, t) - (this.isWindow ? wHeight / 2 : e.height / 2); },

  bottomtop:    function(isSelf, e, t) { return this.isWindow ? t.top - wHeight : t.top - e.bottom; },
  bottommiddle: function(isSelf, e, t) { return this.getPos('bottombottom', isSelf, e, t) - t.height / 2; },
  bottombottom: function(isSelf, e, t) { return this.isWindow ? t.bottom - wHeight : isSelf ? this.el.scrollHeight - this.el.scrollTop - this.el.offsetHeight : t.bottom - e.bottom; },

  leftleft:     function(isSelf, e, t) { return this.isWindow ? t.left : isSelf ? this.el.scrollLeft : t.left - e.left; },
  leftcenter:   function(isSelf, e, t) { return this.getPos('leftleft', isSelf, e, t) + t.width / 2; },
  leftright:    function(isSelf, e, t) { return this.isWindow ? t.right : t.right - e.left; },

  centerleft:   function(isSelf, e, t) { return this.getPos('leftleft', isSelf, e, t) - (this.isWindow ? wWidth / 2 : e.width / 2); },
  centercenter: function(isSelf, e, t) { return this.getPos('centerleft', isSelf, e, t) + t.width / 2; },
  centerright:  function(isSelf, e, t) { return -this.getPos('rightright', isSelf, e, t) - (this.isWindow ? wWidth / 2 : e.width / 2); },

  rightleft:    function(isSelf, e, t) { return this.isWindow ? t.left - wWidth : t.left - e.right; },
  rightcenter:  function(isSelf, e, t) { return this.getPos('rightright', isSelf, e, t) - t.width / 2; },
  rightright:   function(isSelf, e, t) { return this.isWindow ? t.right - wWidth : isSelf ? this.el.scrollWidth - this.el.scrollLeft - this.el.offsetWidth : t.right - e.right; }
};

export function on(el, options) {
  const id = el.getAttribute('data-scrollon');
  if (id === null) {
    return new RollFrame(el, 'on', options);
  }

  queue[id].add(options);
  return queue[id];
}

export function to(el, options) {
  const id = el.getAttribute('data-scrollto');
  id && queue[id].stop();
  return new RollFrame(el, 'to', options);
}

export function direction(el, options) {
  const id = el.getAttribute('data-scrolldirection');
  if (id === null) {
    return new RollFrame(el, 'direction', options);
  }

  queue[id].add(options);
  return queue[id];
}
