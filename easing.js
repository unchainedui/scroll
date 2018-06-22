export function linear(t, b, c, d) {
  return c * t / d + b;
}

export function inQuad(t, b, c, d) {
  return c * ( t /= d ) * t + b;
}

export function outQuad(t, b, c, d) {
  return -c * ( t /= d ) * ( t - 2 ) + b;
}

export function inOutQuad(t, b, c, d) {
  if ((t/=d/2) < 1) return c/2*t*t + b;
  return -c/2 * ((--t)*(t-2) - 1) + b;
}

export function inCubic(t, b, c, d) {
  return c*(t/=d)*t*t + b;
}

export function outCubic(t, b, c, d) {
  return c*((t=t/d-1)*t*t + 1) + b;
}

export function inOutCubic(t, b, c, d) {
  if ((t/=d/2) < 1) return c/2*t*t*t + b;
  return c/2*((t-=2)*t*t + 2) + b;
}

export function inQuart(t, b, c, d) {
  return c*(t/=d)*t*t*t + b;
}

export function outQuart(t, b, c, d) {
  return -c * ((t=t/d-1)*t*t*t - 1) + b;
}

export function inOutQuart(t, b, c, d) {
  if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
  return -c/2 * ((t-=2)*t*t*t - 2) + b;
}

export function inQuint(t, b, c, d) {
  return c*(t/=d)*t*t*t*t + b;
}

export function outQuint(t, b, c, d) {
  return c*((t=t/d-1)*t*t*t*t + 1) + b;
}

export function inOutQuint(t, b, c, d) {
  if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
  return c/2*((t-=2)*t*t*t*t + 2) + b;
}

export function inSine(t, b, c, d) {
  return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
}

export function outSine(t, b, c, d) {
  return c * Math.sin(t/d * (Math.PI/2)) + b;
}

export function inOutSine(t, b, c, d) {
  return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
}

export function inExpo(t, b, c, d) {
  return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
}

export function outExpo(t, b, c, d) {
  return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
}

export function inOutExpo(t, b, c, d) {
  if (t==0) return b;
  if (t==d) return b+c;
  if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
  return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
}

export function inCirc(t, b, c, d) {
  return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
}

export function outCirc(t, b, c, d) {
  return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
}

export function inOutCirc(t, b, c, d) {
  if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
  return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
}

export function inElastic(t, b, c, d) {
  let s=1.70158;let p=0;let a=c;
  if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
  if (a < Math.abs(c)) { a=c; let s=p/4; }
  else { let s = p/(2*Math.PI) * Math.asin (c/a); }
  return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
}

export function outElastic(t, b, c, d) {
  let s=1.70158;let p=0;let a=c;
  if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
  if (a < Math.abs(c)) { a=c; let s=p/4; }
  else { let s = p/(2*Math.PI) * Math.asin (c/a); }
  return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
}

export function inOutElastic(t, b, c, d) {
  let s=1.70158;let p=0;let a=c;
  if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
  if (a < Math.abs(c)) { a=c; let s=p/4; }
  else { let s = p/(2*Math.PI) * Math.asin (c/a);}
  if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
  return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
}

export function inBack(t, b, c, d, s) {
  if (s == undefined) s = 1.70158;
  return c*(t/=d)*t*((s+1)*t - s) + b;
}

export function outBack(t, b, c, d, s) {
  if (s == undefined) s = 1.70158;
  return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
}

export function inOutBack(t, b, c, d, s) {
  if (s == undefined) s = 1.70158;
  if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
  return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
}
