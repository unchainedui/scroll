(function () {
  'use strict';

  const rxClassOnly = /^\.([-\w]+)$/;
  const rxIdOnly = /^#([-\w]+)$/;

  function get(selector, root = document) {
    const id = selector.match(rxIdOnly);
    if (id) {
      return document.getElementById(id[1]);
    }

    const className = selector.match(rxClassOnly);
    if (className) {
      return root.getElementsByClassName(className[1]);
    }

    return root.querySelectorAll(selector);
  }

  function closest(el, selector) {
    while (!el.matches(selector) && (el = el.parentElement));
    return el;
  }

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function on(el, event, selector, handler, options) {
    if (typeof selector !== 'string') {
      handler = selector;
      selector = undefined;
    }

    if (!selector) {
      el.addEventListener(event, handler, options);
      return handler;
    }

    return on(el, event, e => {
      const target = closest(e.target, selector);
      if (target) {
        handler.call(target, e);
      }
    }, options);
  }

  function off(el, event, handler, options) {
    el.removeEventListener(event, handler, options);
    return handler;
  }

  const prefix = (() => {
    const styles = window.getComputedStyle(document.documentElement, '');
    const pre = (Array.prototype.slice
      .call(styles)
      .join('')
      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && [ '', 'o' ])
    )[1];
    return pre[0].toUpperCase() + pre.substr(1);
  })();

  const prefixed = (prop, ctx) => {
    if (!ctx) {
      ctx = document.documentElement;
    }

    return ctx[prop] ? ctx[prop] : prefix + (prop[0].toUpperCase() + prop.substr(1));
  };

  const requestAnimationFrame = (() => {
    const rAF = prefixed('requestAnimationFrame', window);
    if (rAF) {
      return rAF;
    }

    let lastTime = 0;
    return function(callback) {
      const currTime = new Date().getTime();
      const timeToCall = Math.max(0, 16 - (currTime - lastTime));
      const id = window.setTimeout(() => {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    }
  })();

  const preTransform = prefixed('transform');
  const transition = prefixed('transition');
  const isTouch = !!('ontouchstart' in window);

  const browser = (function() {
    const ua = navigator.userAgent;
    let tem;
    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return {
        name: 'IE',
        version: tem[1] ? parseFloat(tem[1]) : null
      }
    }

    if (M[1] === 'Chrome') {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem !== null) {
        return {
          name: tem[1].replace('OPR', 'Opera'),
          version: parseFloat(tem[2])
        }
      }
    }

    M = M[2] ? [ M[1], M[2] ] : [ navigator.appName, navigator.appVersion, '-?' ];

    if ((tem = ua.match(/version\/(\d+)/i)) !== null) {
      M.splice(1, 1, tem[1]);
    }

    return {
      name: M[0],
      version: parseFloat(M[1])
    }
  })();

  function linear(t, b, c, d) {
    return c * t / d + b;
  }

  function inQuad(t, b, c, d) {
    return c * ( t /= d ) * t + b;
  }

  function outQuad(t, b, c, d) {
    return -c * ( t /= d ) * ( t - 2 ) + b;
  }

  function inOutQuad(t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t + b;
    return -c/2 * ((--t)*(t-2) - 1) + b;
  }

  function inCubic(t, b, c, d) {
    return c*(t/=d)*t*t + b;
  }

  function outCubic(t, b, c, d) {
    return c*((t=t/d-1)*t*t + 1) + b;
  }

  function inOutCubic(t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t + b;
    return c/2*((t-=2)*t*t + 2) + b;
  }

  function inQuart(t, b, c, d) {
    return c*(t/=d)*t*t*t + b;
  }

  function outQuart(t, b, c, d) {
    return -c * ((t=t/d-1)*t*t*t - 1) + b;
  }

  function inOutQuart(t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
    return -c/2 * ((t-=2)*t*t*t - 2) + b;
  }

  function inQuint(t, b, c, d) {
    return c*(t/=d)*t*t*t*t + b;
  }

  function outQuint(t, b, c, d) {
    return c*((t=t/d-1)*t*t*t*t + 1) + b;
  }

  function inOutQuint(t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  }

  function inSine(t, b, c, d) {
    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
  }

  function outSine(t, b, c, d) {
    return c * Math.sin(t/d * (Math.PI/2)) + b;
  }

  function inOutSine(t, b, c, d) {
    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
  }

  function inExpo(t, b, c, d) {
    return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
  }

  function outExpo(t, b, c, d) {
    return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
  }

  function inOutExpo(t, b, c, d) {
    if (t==0) return b;
    if (t==d) return b+c;
    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
  }

  function inCirc(t, b, c, d) {
    return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
  }

  function outCirc(t, b, c, d) {
    return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
  }

  function inOutCirc(t, b, c, d) {
    if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
    return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
  }

  function inElastic(t, b, c, d) {
    let s=1.70158;let p=0;let a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; }
    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
  }

  function outElastic(t, b, c, d) {
    let s=1.70158;let p=0;let a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; }
    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
  }

  function inOutElastic(t, b, c, d) {
    let s=1.70158;let p=0;let a=c;
    if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
    if (a < Math.abs(c)) { a=c; }
    if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
  }

  function inBack(t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*(t/=d)*t*((s+1)*t - s) + b;
  }

  function outBack(t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
  }

  function inOutBack(t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
  }

  var easing = /*#__PURE__*/Object.freeze({
    __proto__: null,
    linear: linear,
    inQuad: inQuad,
    outQuad: outQuad,
    inOutQuad: inOutQuad,
    inCubic: inCubic,
    outCubic: outCubic,
    inOutCubic: inOutCubic,
    inQuart: inQuart,
    outQuart: outQuart,
    inOutQuart: inOutQuart,
    inQuint: inQuint,
    outQuint: outQuint,
    inOutQuint: inOutQuint,
    inSine: inSine,
    outSine: outSine,
    inOutSine: inOutSine,
    inExpo: inExpo,
    outExpo: outExpo,
    inOutExpo: inOutExpo,
    inCirc: inCirc,
    outCirc: outCirc,
    inOutCirc: inOutCirc,
    inElastic: inElastic,
    outElastic: outElastic,
    inOutElastic: inOutElastic,
    inBack: inBack,
    outBack: outBack,
    inOutBack: inOutBack
  });

  const fix = browser.name === 'safari' && browser.version < 13;

  const userScrollEvent = 'onwheel' in document.createElement('div') ? 'wheel' : // Modern browsers support 'wheel'
    document.onmousewheel !== undefined ? 'mousewheel' : // Webkit and IE support at least 'mousewheel'
    'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox

  const windowScrollElement = fix ? document.body : document.documentElement;
  function getScrollableEl(el) {
    if (el === window || el === document.body || el === document.documentElement) {
      return windowScrollElement;
    }

    return el
  }

  let queueIndex = 0;
  let queueLength = 0;
  const queue = {};
  const documentElement = document.documentElement;

  //handling window resize
  let handleWindowResize;
  let windowResized = true;
  let wHeight;
  let wWidth;

  //calc engine
  const engine = function() {
    if (!handleWindowResize) {
      handleWindowResize = on(window, 'resize', () => {
        windowResized = true;
      });
    }

    if (windowResized) {
      wHeight = Math.max(documentElement.clientHeight, window.innerHeight || 0);
      wWidth = Math.max(documentElement.clientWidth, window.innerWidth || 0);
    }

    for (const i in queue) {
      const frame = queue[i];
      (frame.toUpdate || windowResized) && frame.calc();
    }

    windowResized = false;
    if (queueLength) {
      requestAnimationFrame(engine);
    } else {
      off(window, 'resize', handleWindowResize);
      handleWindowResize = undefined;
    }
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

        this.onScroll = on(el, userScrollEvent, () => {
          this.stop();
          off(el, userScrollEvent, this.onScroll);
        });

        this.begin = Date.now();
        this.toUpdate = true;
        break;

      case 'direction':
        this.top = el.scrollTop;
        this.left = el.scrollLeft;

        this.onScroll = on(el, userScrollEvent, () => {
          this.toUpdate = true;
        });
        isTouch && on(el, 'touchmove', this.onScroll);
        this.c = [];
        this.add(options);
        break;

      case 'on':
        this.onScroll = on(this.isWindow ? window : el, 'scroll', () => {
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
        off(this.el, userScrollEvent, this.onScroll);
      } else {
        off(window, 'resize', this.onScroll);
        off(window, 'scroll', this.onScroll);
        off(window, 'touchmove', this.onScroll);
        off(this.el, 'scroll', this.onScroll);
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

  function on$1(el, options) {
    const id = el.getAttribute('data-scrollon');
    if (id === null) {
      return new RollFrame(el, 'on', options);
    }

    queue[id].add(options);
    return queue[id];
  }

  function to(el, options) {
    const id = el.getAttribute('data-scrollto');
    id && queue[id].stop();
    return new RollFrame(el, 'to', options);
  }

  function direction(el, options) {
    const id = el.getAttribute('data-scrolldirection');
    if (id === null) {
      return new RollFrame(el, 'direction', options);
    }

    queue[id].add(options);
    return queue[id];
  }

  const rxCondition = /^([a-z]+)(?:\(([-0-9]+|([a-z]+)(?:\(([-0-9]+|)\))?)\))?/;

  function scrollOn(el, options, cb) {
    el = getScrollableEl(el);

    let currentConditions;
    const conditions = options.condition.split(' ');
    const parsed = {
      cb: cb,
      c: []
    };

    if (typeof options.on === 'string') {
      parsed.selector = options.on;
    } else if (options.on instanceof HTMLElement) {
      parsed.on = [ options.on ];
    } else if (!options.on) {
      parsed.on = [ el ];
    }

    for (const i in conditions) {
      const match = conditions[i].match(rxCondition);
      const condition = {};

      if (!match) {
        throw new Error('Can\'t parse conditions');
      }

      if (i == 0 || match[1] === 'or') {
        currentConditions = [];
        parsed.c.push(currentConditions);
      }

      if (match[1] === 'and' || match[1] === 'or') {
        continue;
      }

      if (!match[3]) {
        match[3] = match[1];
        match[4] = match[2];
      }

      condition[match[1]] = [ match[3], ~~match[4] ];
      currentConditions.push(condition);
    }

    return on$1(el, parsed);
  }

  function scrollTo(el, options, cb) {
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
        duration: options.duration === undefined ? 1000 : options.duration,
        ease: options.ease || 'linear',
        cb: cb
      });
    }
  }

  function scrollDirection(el, options, cb) {
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

  var scroll = {
    on: scrollOn,
    to: scrollTo,
    direction: scrollDirection
  };

  ready(() => {
    const elHeader = get('header').item(0);
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
      console.log('direction', cond);
    });
  });

}());
