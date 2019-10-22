import { on } from './engine';
import { getScrollableEl } from './util';
const rxCondition = /^([a-z]+)(?:\(([-0-9]+|([a-z]+)(?:\(([-0-9]+|)\))?)\))?/;

export default function scrollOn(el, options, cb) {
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

  return on(el, parsed, cb);
}
