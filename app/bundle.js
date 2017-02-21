(function () {
'use strict';

var ascending = function(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
};

var bisector = function(compare) {
  if (compare.length === 1) compare = ascendingComparator(compare);
  return {
    left: function(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) < 0) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    },
    right: function(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) > 0) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    }
  };
};

function ascendingComparator(f) {
  return function(d, x) {
    return ascending(f(d), x);
  };
}

var ascendingBisect = bisector(ascending);
var bisectRight = ascendingBisect.right;

var number = function(x) {
  return x === null ? NaN : +x;
};

var extent = function(array, f) {
  var i = -1,
      n = array.length,
      a,
      b,
      c;

  if (f == null) {
    while (++i < n) if ((b = array[i]) != null && b >= b) { a = c = b; break; }
    while (++i < n) if ((b = array[i]) != null) {
      if (a > b) a = b;
      if (c < b) c = b;
    }
  }

  else {
    while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = c = b; break; }
    while (++i < n) if ((b = f(array[i], i, array)) != null) {
      if (a > b) a = b;
      if (c < b) c = b;
    }
  }

  return [a, c];
};

var identity = function(x) {
  return x;
};

var range = function(start, stop, step) {
  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

  var i = -1,
      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
      range = new Array(n);

  while (++i < n) {
    range[i] = start + i * step;
  }

  return range;
};

var e10 = Math.sqrt(50);
var e5 = Math.sqrt(10);
var e2 = Math.sqrt(2);

var ticks = function(start, stop, count) {
  var step = tickStep(start, stop, count);
  return range(
    Math.ceil(start / step) * step,
    Math.floor(stop / step) * step + step / 2, // inclusive
    step
  );
};

function tickStep(start, stop, count) {
  var step0 = Math.abs(stop - start) / Math.max(0, count),
      step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
      error = step0 / step1;
  if (error >= e10) step1 *= 10;
  else if (error >= e5) step1 *= 5;
  else if (error >= e2) step1 *= 2;
  return stop < start ? -step1 : step1;
}

var sturges = function(values) {
  return Math.ceil(Math.log(values.length) / Math.LN2) + 1;
};

var threshold = function(array, p, f) {
  if (f == null) f = number;
  if (!(n = array.length)) return;
  if ((p = +p) <= 0 || n < 2) return +f(array[0], 0, array);
  if (p >= 1) return +f(array[n - 1], n - 1, array);
  var n,
      h = (n - 1) * p,
      i = Math.floor(h),
      a = +f(array[i], i, array),
      b = +f(array[i + 1], i + 1, array);
  return a + (b - a) * (h - i);
};

var min = function(array, f) {
  var i = -1,
      n = array.length,
      a,
      b;

  if (f == null) {
    while (++i < n) if ((b = array[i]) != null && b >= b) { a = b; break; }
    while (++i < n) if ((b = array[i]) != null && a > b) a = b;
  }

  else {
    while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = b; break; }
    while (++i < n) if ((b = f(array[i], i, array)) != null && a > b) a = b;
  }

  return a;
};

function length(d) {
  return d.length;
}

var prefix = "$";

function Map() {}

Map.prototype = map$1.prototype = {
  constructor: Map,
  has: function(key) {
    return (prefix + key) in this;
  },
  get: function(key) {
    return this[prefix + key];
  },
  set: function(key, value) {
    this[prefix + key] = value;
    return this;
  },
  remove: function(key) {
    var property = prefix + key;
    return property in this && delete this[property];
  },
  clear: function() {
    for (var property in this) if (property[0] === prefix) delete this[property];
  },
  keys: function() {
    var keys = [];
    for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
    return keys;
  },
  values: function() {
    var values = [];
    for (var property in this) if (property[0] === prefix) values.push(this[property]);
    return values;
  },
  entries: function() {
    var entries = [];
    for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
    return entries;
  },
  size: function() {
    var size = 0;
    for (var property in this) if (property[0] === prefix) ++size;
    return size;
  },
  empty: function() {
    for (var property in this) if (property[0] === prefix) return false;
    return true;
  },
  each: function(f) {
    for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
  }
};

function map$1(object, f) {
  var map = new Map;

  // Copy constructor.
  if (object instanceof Map) object.each(function(value, key) { map.set(key, value); });

  // Index array by numeric index or specified key function.
  else if (Array.isArray(object)) {
    var i = -1,
        n = object.length,
        o;

    if (f == null) while (++i < n) map.set(i, object[i]);
    else while (++i < n) map.set(f(o = object[i], i, object), o);
  }

  // Convert object to map.
  else if (object) for (var key in object) map.set(key, object[key]);

  return map;
}

function Set() {}

var proto = map$1.prototype;

Set.prototype = set.prototype = {
  constructor: Set,
  has: proto.has,
  add: function(value) {
    value += "";
    this[prefix + value] = value;
    return this;
  },
  remove: proto.remove,
  clear: proto.clear,
  values: proto.keys,
  size: proto.size,
  empty: proto.empty,
  each: proto.each
};

function set(object, f) {
  var set = new Set;

  // Copy constructor.
  if (object instanceof Set) object.each(function(value) { set.add(value); });

  // Otherwise, assume it’s an array.
  else if (object) {
    var i = -1, n = object.length;
    if (f == null) while (++i < n) set.add(object[i]);
    else while (++i < n) set.add(f(object[i], i, object));
  }

  return set;
}

var array$1 = Array.prototype;

var map$3 = array$1.map;
var slice$1 = array$1.slice;

var implicit = {name: "implicit"};

var define = function(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
};

function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}

function Color() {}

var darker = 0.7;
var brighter = 1 / darker;

var reI = "\\s*([+-]?\\d+)\\s*";
var reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*";
var reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
var reHex3 = /^#([0-9a-f]{3})$/;
var reHex6 = /^#([0-9a-f]{6})$/;
var reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$");
var reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$");
var reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$");
var reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$");
var reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$");
var reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

var named = {
  aliceblue: 0xf0f8ff,
  antiquewhite: 0xfaebd7,
  aqua: 0x00ffff,
  aquamarine: 0x7fffd4,
  azure: 0xf0ffff,
  beige: 0xf5f5dc,
  bisque: 0xffe4c4,
  black: 0x000000,
  blanchedalmond: 0xffebcd,
  blue: 0x0000ff,
  blueviolet: 0x8a2be2,
  brown: 0xa52a2a,
  burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0,
  chartreuse: 0x7fff00,
  chocolate: 0xd2691e,
  coral: 0xff7f50,
  cornflowerblue: 0x6495ed,
  cornsilk: 0xfff8dc,
  crimson: 0xdc143c,
  cyan: 0x00ffff,
  darkblue: 0x00008b,
  darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b,
  darkgray: 0xa9a9a9,
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  darkkhaki: 0xbdb76b,
  darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f,
  darkorange: 0xff8c00,
  darkorchid: 0x9932cc,
  darkred: 0x8b0000,
  darksalmon: 0xe9967a,
  darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b,
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  darkturquoise: 0x00ced1,
  darkviolet: 0x9400d3,
  deeppink: 0xff1493,
  deepskyblue: 0x00bfff,
  dimgray: 0x696969,
  dimgrey: 0x696969,
  dodgerblue: 0x1e90ff,
  firebrick: 0xb22222,
  floralwhite: 0xfffaf0,
  forestgreen: 0x228b22,
  fuchsia: 0xff00ff,
  gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff,
  gold: 0xffd700,
  goldenrod: 0xdaa520,
  gray: 0x808080,
  green: 0x008000,
  greenyellow: 0xadff2f,
  grey: 0x808080,
  honeydew: 0xf0fff0,
  hotpink: 0xff69b4,
  indianred: 0xcd5c5c,
  indigo: 0x4b0082,
  ivory: 0xfffff0,
  khaki: 0xf0e68c,
  lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5,
  lawngreen: 0x7cfc00,
  lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6,
  lightcoral: 0xf08080,
  lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2,
  lightgray: 0xd3d3d3,
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  lightpink: 0xffb6c1,
  lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa,
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  lightsteelblue: 0xb0c4de,
  lightyellow: 0xffffe0,
  lime: 0x00ff00,
  limegreen: 0x32cd32,
  linen: 0xfaf0e6,
  magenta: 0xff00ff,
  maroon: 0x800000,
  mediumaquamarine: 0x66cdaa,
  mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3,
  mediumpurple: 0x9370db,
  mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee,
  mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc,
  mediumvioletred: 0xc71585,
  midnightblue: 0x191970,
  mintcream: 0xf5fffa,
  mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5,
  navajowhite: 0xffdead,
  navy: 0x000080,
  oldlace: 0xfdf5e6,
  olive: 0x808000,
  olivedrab: 0x6b8e23,
  orange: 0xffa500,
  orangered: 0xff4500,
  orchid: 0xda70d6,
  palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98,
  paleturquoise: 0xafeeee,
  palevioletred: 0xdb7093,
  papayawhip: 0xffefd5,
  peachpuff: 0xffdab9,
  peru: 0xcd853f,
  pink: 0xffc0cb,
  plum: 0xdda0dd,
  powderblue: 0xb0e0e6,
  purple: 0x800080,
  rebeccapurple: 0x663399,
  red: 0xff0000,
  rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1,
  saddlebrown: 0x8b4513,
  salmon: 0xfa8072,
  sandybrown: 0xf4a460,
  seagreen: 0x2e8b57,
  seashell: 0xfff5ee,
  sienna: 0xa0522d,
  silver: 0xc0c0c0,
  skyblue: 0x87ceeb,
  slateblue: 0x6a5acd,
  slategray: 0x708090,
  slategrey: 0x708090,
  snow: 0xfffafa,
  springgreen: 0x00ff7f,
  steelblue: 0x4682b4,
  tan: 0xd2b48c,
  teal: 0x008080,
  thistle: 0xd8bfd8,
  tomato: 0xff6347,
  turquoise: 0x40e0d0,
  violet: 0xee82ee,
  wheat: 0xf5deb3,
  white: 0xffffff,
  whitesmoke: 0xf5f5f5,
  yellow: 0xffff00,
  yellowgreen: 0x9acd32
};

define(Color, color, {
  displayable: function() {
    return this.rgb().displayable();
  },
  toString: function() {
    return this.rgb() + "";
  }
});

function color(format) {
  var m;
  format = (format + "").trim().toLowerCase();
  return (m = reHex3.exec(format)) ? (m = parseInt(m[1], 16), new Rgb((m >> 8 & 0xf) | (m >> 4 & 0x0f0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1)) // #f00
      : (m = reHex6.exec(format)) ? rgbn(parseInt(m[1], 16)) // #ff0000
      : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
      : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
      : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
      : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
      : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
      : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
      : named.hasOwnProperty(format) ? rgbn(named[format])
      : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
      : null;
}

function rgbn(n) {
  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
}

function rgba(r, g, b, a) {
  if (a <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a);
}

function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb;
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}

function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}

function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}

define(Rgb, rgb, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb: function() {
    return this;
  },
  displayable: function() {
    return (0 <= this.r && this.r <= 255)
        && (0 <= this.g && this.g <= 255)
        && (0 <= this.b && this.b <= 255)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  toString: function() {
    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "rgb(" : "rgba(")
        + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.b) || 0))
        + (a === 1 ? ")" : ", " + a + ")");
  }
}));

function hsla(h, s, l, a) {
  if (a <= 0) h = s = l = NaN;
  else if (l <= 0 || l >= 1) h = s = NaN;
  else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a);
}

function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl;
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      h = NaN,
      s = max - min,
      l = (max + min) / 2;
  if (s) {
    if (r === max) h = (g - b) / s + (g < b) * 6;
    else if (g === max) h = (b - r) / s + 2;
    else h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}

function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}

function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

define(Hsl, hsl, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function() {
    var h = this.h % 360 + (this.h < 0) * 360,
        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
        l = this.l,
        m2 = l + (l < 0.5 ? l : 1 - l) * s,
        m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  displayable: function() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
        && (0 <= this.l && this.l <= 1)
        && (0 <= this.opacity && this.opacity <= 1);
  }
}));

/* From FvD 13.37, CSS Color Module Level 3 */
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60
      : h < 180 ? m2
      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
      : m1) * 255;
}

var deg2rad = Math.PI / 180;
var rad2deg = 180 / Math.PI;

var Kn = 18;
var Xn = 0.950470;
var Yn = 1;
var Zn = 1.088830;
var t0 = 4 / 29;
var t1 = 6 / 29;
var t2 = 3 * t1 * t1;
var t3 = t1 * t1 * t1;

function labConvert(o) {
  if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
  if (o instanceof Hcl) {
    var h = o.h * deg2rad;
    return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
  }
  if (!(o instanceof Rgb)) o = rgbConvert(o);
  var b = rgb2xyz(o.r),
      a = rgb2xyz(o.g),
      l = rgb2xyz(o.b),
      x = xyz2lab((0.4124564 * b + 0.3575761 * a + 0.1804375 * l) / Xn),
      y = xyz2lab((0.2126729 * b + 0.7151522 * a + 0.0721750 * l) / Yn),
      z = xyz2lab((0.0193339 * b + 0.1191920 * a + 0.9503041 * l) / Zn);
  return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
}

function lab(l, a, b, opacity) {
  return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
}

function Lab(l, a, b, opacity) {
  this.l = +l;
  this.a = +a;
  this.b = +b;
  this.opacity = +opacity;
}

define(Lab, lab, extend(Color, {
  brighter: function(k) {
    return new Lab(this.l + Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  darker: function(k) {
    return new Lab(this.l - Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  rgb: function() {
    var y = (this.l + 16) / 116,
        x = isNaN(this.a) ? y : y + this.a / 500,
        z = isNaN(this.b) ? y : y - this.b / 200;
    y = Yn * lab2xyz(y);
    x = Xn * lab2xyz(x);
    z = Zn * lab2xyz(z);
    return new Rgb(
      xyz2rgb( 3.2404542 * x - 1.5371385 * y - 0.4985314 * z), // D65 -> sRGB
      xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
      xyz2rgb( 0.0556434 * x - 0.2040259 * y + 1.0572252 * z),
      this.opacity
    );
  }
}));

function xyz2lab(t) {
  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
}

function lab2xyz(t) {
  return t > t1 ? t * t * t : t2 * (t - t0);
}

function xyz2rgb(x) {
  return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
}

function rgb2xyz(x) {
  return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function hclConvert(o) {
  if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
  if (!(o instanceof Lab)) o = labConvert(o);
  var h = Math.atan2(o.b, o.a) * rad2deg;
  return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
}

function hcl(h, c, l, opacity) {
  return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
}

function Hcl(h, c, l, opacity) {
  this.h = +h;
  this.c = +c;
  this.l = +l;
  this.opacity = +opacity;
}

define(Hcl, hcl, extend(Color, {
  brighter: function(k) {
    return new Hcl(this.h, this.c, this.l + Kn * (k == null ? 1 : k), this.opacity);
  },
  darker: function(k) {
    return new Hcl(this.h, this.c, this.l - Kn * (k == null ? 1 : k), this.opacity);
  },
  rgb: function() {
    return labConvert(this).rgb();
  }
}));

var A = -0.14861;
var B = +1.78277;
var C = -0.29227;
var D = -0.90649;
var E = +1.97294;
var ED = E * D;
var EB = E * B;
var BC_DA = B * C - D * A;

function cubehelixConvert(o) {
  if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Rgb)) o = rgbConvert(o);
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
      bl = b - l,
      k = (E * (g - l) - C * bl) / D,
      s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
      h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
  return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
}

function cubehelix(h, s, l, opacity) {
  return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
}

function Cubehelix(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

define(Cubehelix, cubehelix, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function() {
    var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
        l = +this.l,
        a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
        cosh = Math.cos(h),
        sinh = Math.sin(h);
    return new Rgb(
      255 * (l + a * (A * cosh + B * sinh)),
      255 * (l + a * (C * cosh + D * sinh)),
      255 * (l + a * (E * cosh)),
      this.opacity
    );
  }
}));

function basis(t1, v0, v1, v2, v3) {
  var t2 = t1 * t1, t3 = t2 * t1;
  return ((1 - 3 * t1 + 3 * t2 - t3) * v0
      + (4 - 6 * t2 + 3 * t3) * v1
      + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
      + t3 * v3) / 6;
}

var constant$1 = function(x) {
  return function() {
    return x;
  };
};

function linear$1(a, d) {
  return function(t) {
    return a + t * d;
  };
}

function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}

function hue(a, b) {
  var d = b - a;
  return d ? linear$1(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant$1(isNaN(a) ? b : a);
}

function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
  };
}

function nogamma(a, b) {
  var d = b - a;
  return d ? linear$1(a, d) : constant$1(isNaN(a) ? b : a);
}

var rgb$1 = ((function rgbGamma(y) {
  var color$$1 = gamma(y);

  function rgb$$1(start, end) {
    var r = color$$1((start = rgb(start)).r, (end = rgb(end)).r),
        g = color$$1(start.g, end.g),
        b = color$$1(start.b, end.b),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  rgb$$1.gamma = rgbGamma;

  return rgb$$1;
}))(1);

var array$2 = function(a, b) {
  var nb = b ? b.length : 0,
      na = a ? Math.min(nb, a.length) : 0,
      x = new Array(nb),
      c = new Array(nb),
      i;

  for (i = 0; i < na; ++i) x[i] = interpolateValue(a[i], b[i]);
  for (; i < nb; ++i) c[i] = b[i];

  return function(t) {
    for (i = 0; i < na; ++i) c[i] = x[i](t);
    return c;
  };
};

var date = function(a, b) {
  var d = new Date;
  return a = +a, b -= a, function(t) {
    return d.setTime(a + b * t), d;
  };
};

var reinterpolate = function(a, b) {
  return a = +a, b -= a, function(t) {
    return a + b * t;
  };
};

var object = function(a, b) {
  var i = {},
      c = {},
      k;

  if (a === null || typeof a !== "object") a = {};
  if (b === null || typeof b !== "object") b = {};

  for (k in b) {
    if (k in a) {
      i[k] = interpolateValue(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }

  return function(t) {
    for (k in i) c[k] = i[k](t);
    return c;
  };
};

var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
var reB = new RegExp(reA.source, "g");

function zero(b) {
  return function() {
    return b;
  };
}

function one(b) {
  return function(t) {
    return b(t) + "";
  };
}

var string = function(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
      am, // current match in a
      bm, // current match in b
      bs, // string preceding current number in b, if any
      i = -1, // index in s
      s = [], // string constants and placeholders
      q = []; // number interpolators

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Interpolate pairs of numbers in a & b.
  while ((am = reA.exec(a))
      && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) { // a string precedes the next number in b
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
      if (s[i]) s[i] += bm; // coalesce with previous string
      else s[++i] = bm;
    } else { // interpolate non-matching numbers
      s[++i] = null;
      q.push({i: i, x: reinterpolate(am, bm)});
    }
    bi = reB.lastIndex;
  }

  // Add remains of b.
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs; // coalesce with previous string
    else s[++i] = bs;
  }

  // Special optimization for only a single match.
  // Otherwise, interpolate each of the numbers and rejoin the string.
  return s.length < 2 ? (q[0]
      ? one(q[0].x)
      : zero(b))
      : (b = q.length, function(t) {
          for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        });
};

var interpolateValue = function(a, b) {
  var t = typeof b, c;
  return b == null || t === "boolean" ? constant$1(b)
      : (t === "number" ? reinterpolate
      : t === "string" ? ((c = color(b)) ? (b = c, rgb$1) : string)
      : b instanceof color ? rgb$1
      : b instanceof Date ? date
      : Array.isArray(b) ? array$2
      : isNaN(b) ? object
      : reinterpolate)(a, b);
};

var interpolateRound = function(a, b) {
  return a = +a, b -= a, function(t) {
    return Math.round(a + b * t);
  };
};

function cubehelix$1(hue$$1) {
  return (function cubehelixGamma(y) {
    y = +y;

    function cubehelix$$1(start, end) {
      var h = hue$$1((start = cubehelix(start)).h, (end = cubehelix(end)).h),
          s = nogamma(start.s, end.s),
          l = nogamma(start.l, end.l),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.h = h(t);
        start.s = s(t);
        start.l = l(Math.pow(t, y));
        start.opacity = opacity(t);
        return start + "";
      };
    }

    cubehelix$$1.gamma = cubehelixGamma;

    return cubehelix$$1;
  })(1);
}

cubehelix$1(hue);
var cubehelixLong = cubehelix$1(nogamma);

var constant$2 = function(x) {
  return function() {
    return x;
  };
};

var number$1 = function(x) {
  return +x;
};

var unit = [0, 1];

function deinterpolateLinear(a, b) {
  return (b -= (a = +a))
      ? function(x) { return (x - a) / b; }
      : constant$2(b);
}

function deinterpolateClamp(deinterpolate) {
  return function(a, b) {
    var d = deinterpolate(a = +a, b = +b);
    return function(x) { return x <= a ? 0 : x >= b ? 1 : d(x); };
  };
}

function reinterpolateClamp(reinterpolate) {
  return function(a, b) {
    var r = reinterpolate(a = +a, b = +b);
    return function(t) { return t <= 0 ? a : t >= 1 ? b : r(t); };
  };
}

function bimap(domain, range$$1, deinterpolate, reinterpolate) {
  var d0 = domain[0], d1 = domain[1], r0 = range$$1[0], r1 = range$$1[1];
  if (d1 < d0) d0 = deinterpolate(d1, d0), r0 = reinterpolate(r1, r0);
  else d0 = deinterpolate(d0, d1), r0 = reinterpolate(r0, r1);
  return function(x) { return r0(d0(x)); };
}

function polymap(domain, range$$1, deinterpolate, reinterpolate) {
  var j = Math.min(domain.length, range$$1.length) - 1,
      d = new Array(j),
      r = new Array(j),
      i = -1;

  // Reverse descending domains.
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range$$1 = range$$1.slice().reverse();
  }

  while (++i < j) {
    d[i] = deinterpolate(domain[i], domain[i + 1]);
    r[i] = reinterpolate(range$$1[i], range$$1[i + 1]);
  }

  return function(x) {
    var i = bisectRight(domain, x, 1, j) - 1;
    return r[i](d[i](x));
  };
}

function copy(source, target) {
  return target
      .domain(source.domain())
      .range(source.range())
      .interpolate(source.interpolate())
      .clamp(source.clamp());
}

// deinterpolate(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
// reinterpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding domain value x in [a,b].
function continuous(deinterpolate, reinterpolate) {
  var domain = unit,
      range$$1 = unit,
      interpolate$$1 = interpolateValue,
      clamp = false,
      piecewise,
      output,
      input;

  function rescale() {
    piecewise = Math.min(domain.length, range$$1.length) > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }

  function scale(x) {
    return (output || (output = piecewise(domain, range$$1, clamp ? deinterpolateClamp(deinterpolate) : deinterpolate, interpolate$$1)))(+x);
  }

  scale.invert = function(y) {
    return (input || (input = piecewise(range$$1, domain, deinterpolateLinear, clamp ? reinterpolateClamp(reinterpolate) : reinterpolate)))(+y);
  };

  scale.domain = function(_) {
    return arguments.length ? (domain = map$3.call(_, number$1), rescale()) : domain.slice();
  };

  scale.range = function(_) {
    return arguments.length ? (range$$1 = slice$1.call(_), rescale()) : range$$1.slice();
  };

  scale.rangeRound = function(_) {
    return range$$1 = slice$1.call(_), interpolate$$1 = interpolateRound, rescale();
  };

  scale.clamp = function(_) {
    return arguments.length ? (clamp = !!_, rescale()) : clamp;
  };

  scale.interpolate = function(_) {
    return arguments.length ? (interpolate$$1 = _, rescale()) : interpolate$$1;
  };

  return rescale();
}

// Computes the decimal coefficient and exponent of the specified number x with
// significant digits p, where x is positive and p is in [1, 21] or undefined.
// For example, formatDecimal(1.23) returns ["123", 0].
var formatDecimal = function(x, p) {
  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
  var i, coefficient = x.slice(0, i);

  // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
  // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +x.slice(i + 1)
  ];
};

var exponent = function(x) {
  return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
};

var formatGroup = function(grouping, thousands) {
  return function(value, width) {
    var i = value.length,
        t = [],
        j = 0,
        g = grouping[0],
        length = 0;

    while (i > 0 && g > 0) {
      if (length + g + 1 > width) g = Math.max(1, width - length);
      t.push(value.substring(i -= g, i + g));
      if ((length += g + 1) > width) break;
      g = grouping[j = (j + 1) % grouping.length];
    }

    return t.reverse().join(thousands);
  };
};

var formatDefault = function(x, p) {
  x = x.toPrecision(p);

  out: for (var n = x.length, i = 1, i0 = -1, i1; i < n; ++i) {
    switch (x[i]) {
      case ".": i0 = i1 = i; break;
      case "0": if (i0 === 0) i0 = i; i1 = i; break;
      case "e": break out;
      default: if (i0 > 0) i0 = 0; break;
    }
  }

  return i0 > 0 ? x.slice(0, i0) + x.slice(i1 + 1) : x;
};

var prefixExponent;

var formatPrefixAuto = function(x, p) {
  var d = formatDecimal(x, p);
  if (!d) return x + "";
  var coefficient = d[0],
      exponent = d[1],
      i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
      n = coefficient.length;
  return i === n ? coefficient
      : i > n ? coefficient + new Array(i - n + 1).join("0")
      : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
      : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
};

var formatRounded = function(x, p) {
  var d = formatDecimal(x, p);
  if (!d) return x + "";
  var coefficient = d[0],
      exponent = d[1];
  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
      : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
      : coefficient + new Array(exponent - coefficient.length + 2).join("0");
};

var formatTypes = {
  "": formatDefault,
  "%": function(x, p) { return (x * 100).toFixed(p); },
  "b": function(x) { return Math.round(x).toString(2); },
  "c": function(x) { return x + ""; },
  "d": function(x) { return Math.round(x).toString(10); },
  "e": function(x, p) { return x.toExponential(p); },
  "f": function(x, p) { return x.toFixed(p); },
  "g": function(x, p) { return x.toPrecision(p); },
  "o": function(x) { return Math.round(x).toString(8); },
  "p": function(x, p) { return formatRounded(x * 100, p); },
  "r": formatRounded,
  "s": formatPrefixAuto,
  "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
  "x": function(x) { return Math.round(x).toString(16); }
};

var re = /^(?:(.)?([<>=^]))?([+\-\( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?([a-z%])?$/i;

var formatSpecifier = function(specifier) {
  return new FormatSpecifier(specifier);
};

function FormatSpecifier(specifier) {
  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);

  var match,
      fill = match[1] || " ",
      align = match[2] || ">",
      sign = match[3] || "-",
      symbol = match[4] || "",
      zero = !!match[5],
      width = match[6] && +match[6],
      comma = !!match[7],
      precision = match[8] && +match[8].slice(1),
      type = match[9] || "";

  // The "n" type is an alias for ",g".
  if (type === "n") comma = true, type = "g";

  // Map invalid types to the default format.
  else if (!formatTypes[type]) type = "";

  // If zero fill is specified, padding goes after sign and before digits.
  if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

  this.fill = fill;
  this.align = align;
  this.sign = sign;
  this.symbol = symbol;
  this.zero = zero;
  this.width = width;
  this.comma = comma;
  this.precision = precision;
  this.type = type;
}

FormatSpecifier.prototype.toString = function() {
  return this.fill
      + this.align
      + this.sign
      + this.symbol
      + (this.zero ? "0" : "")
      + (this.width == null ? "" : Math.max(1, this.width | 0))
      + (this.comma ? "," : "")
      + (this.precision == null ? "" : "." + Math.max(0, this.precision | 0))
      + this.type;
};

var prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

function identity$3(x) {
  return x;
}

var formatLocale = function(locale) {
  var group = locale.grouping && locale.thousands ? formatGroup(locale.grouping, locale.thousands) : identity$3,
      currency = locale.currency,
      decimal = locale.decimal;

  function newFormat(specifier) {
    specifier = formatSpecifier(specifier);

    var fill = specifier.fill,
        align = specifier.align,
        sign = specifier.sign,
        symbol = specifier.symbol,
        zero = specifier.zero,
        width = specifier.width,
        comma = specifier.comma,
        precision = specifier.precision,
        type = specifier.type;

    // Compute the prefix and suffix.
    // For SI-prefix, the suffix is lazily computed.
    var prefix = symbol === "$" ? currency[0] : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
        suffix = symbol === "$" ? currency[1] : /[%p]/.test(type) ? "%" : "";

    // What format function should we use?
    // Is this an integer type?
    // Can this type generate exponential notation?
    var formatType = formatTypes[type],
        maybeSuffix = !type || /[defgprs%]/.test(type);

    // Set the default precision if not specified,
    // or clamp the specified precision to the supported range.
    // For significant precision, it must be in [1, 21].
    // For fixed precision, it must be in [0, 20].
    precision = precision == null ? (type ? 6 : 12)
        : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
        : Math.max(0, Math.min(20, precision));

    function format(value) {
      var valuePrefix = prefix,
          valueSuffix = suffix,
          i, n, c;

      if (type === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;

        // Convert negative to positive, and compute the prefix.
        // Note that -0 is not less than 0, but 1 / -0 is!
        var valueNegative = (value < 0 || 1 / value < 0) && (value *= -1, true);

        // Perform the initial formatting.
        value = formatType(value, precision);

        // If the original value was negative, it may be rounded to zero during
        // formatting; treat this as (positive) zero.
        if (valueNegative) {
          i = -1, n = value.length;
          valueNegative = false;
          while (++i < n) {
            if (c = value.charCodeAt(i), (48 < c && c < 58)
                || (type === "x" && 96 < c && c < 103)
                || (type === "X" && 64 < c && c < 71)) {
              valueNegative = true;
              break;
            }
          }
        }

        // Compute the prefix and suffix.
        valuePrefix = (valueNegative ? (sign === "(" ? sign : "-") : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
        valueSuffix = valueSuffix + (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + (valueNegative && sign === "(" ? ")" : "");

        // Break the formatted value into the integer “value” part that can be
        // grouped, and fractional or exponential “suffix” part that is not.
        if (maybeSuffix) {
          i = -1, n = value.length;
          while (++i < n) {
            if (c = value.charCodeAt(i), 48 > c || c > 57) {
              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
              value = value.slice(0, i);
              break;
            }
          }
        }
      }

      // If the fill character is not "0", grouping is applied before padding.
      if (comma && !zero) value = group(value, Infinity);

      // Compute the padding.
      var length = valuePrefix.length + value.length + valueSuffix.length,
          padding = length < width ? new Array(width - length + 1).join(fill) : "";

      // If the fill character is "0", grouping is applied after padding.
      if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

      // Reconstruct the final output based on the desired alignment.
      switch (align) {
        case "<": return valuePrefix + value + valueSuffix + padding;
        case "=": return valuePrefix + padding + value + valueSuffix;
        case "^": return padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
      }
      return padding + valuePrefix + value + valueSuffix;
    }

    format.toString = function() {
      return specifier + "";
    };

    return format;
  }

  function formatPrefix(specifier, value) {
    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
        e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
        k = Math.pow(10, -e),
        prefix = prefixes[8 + e / 3];
    return function(value) {
      return f(k * value) + prefix;
    };
  }

  return {
    format: newFormat,
    formatPrefix: formatPrefix
  };
};

var locale$1;
var format;
var formatPrefix;

defaultLocale({
  decimal: ".",
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});

function defaultLocale(definition) {
  locale$1 = formatLocale(definition);
  format = locale$1.format;
  formatPrefix = locale$1.formatPrefix;
  return locale$1;
}

var precisionFixed = function(step) {
  return Math.max(0, -exponent(Math.abs(step)));
};

var precisionPrefix = function(step, value) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
};

var precisionRound = function(step, max) {
  step = Math.abs(step), max = Math.abs(max) - step;
  return Math.max(0, exponent(max) - exponent(step)) + 1;
};

var tickFormat = function(domain, count, specifier) {
  var start = domain[0],
      stop = domain[domain.length - 1],
      step = tickStep(start, stop, count == null ? 10 : count),
      precision;
  specifier = formatSpecifier(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s": {
      var value = Math.max(Math.abs(start), Math.abs(stop));
      if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
      return formatPrefix(specifier, value);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
      break;
    }
    case "f":
    case "%": {
      if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
      break;
    }
  }
  return format(specifier);
};

function linearish(scale) {
  var domain = scale.domain;

  scale.ticks = function(count) {
    var d = domain();
    return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
  };

  scale.tickFormat = function(count, specifier) {
    return tickFormat(domain(), count, specifier);
  };

  scale.nice = function(count) {
    var d = domain(),
        i = d.length - 1,
        n = count == null ? 10 : count,
        start = d[0],
        stop = d[i],
        step = tickStep(start, stop, n);

    if (step) {
      step = tickStep(Math.floor(start / step) * step, Math.ceil(stop / step) * step, n);
      d[0] = Math.floor(start / step) * step;
      d[i] = Math.ceil(stop / step) * step;
      domain(d);
    }

    return scale;
  };

  return scale;
}

function linear() {
  var scale = continuous(deinterpolateLinear, reinterpolate);

  scale.copy = function() {
    return copy(scale, linear());
  };

  return linearish(scale);
}

function deinterpolate(a, b) {
  return (b = Math.log(b / a))
      ? function(x) { return Math.log(x / a) / b; }
      : constant$2(b);
}

function reinterpolate$1(a, b) {
  return a < 0
      ? function(t) { return -Math.pow(-b, t) * Math.pow(-a, 1 - t); }
      : function(t) { return Math.pow(b, t) * Math.pow(a, 1 - t); };
}

function pow10(x) {
  return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
}

function powp(base) {
  return base === 10 ? pow10
      : base === Math.E ? Math.exp
      : function(x) { return Math.pow(base, x); };
}

function logp(base) {
  return base === Math.E ? Math.log
      : base === 10 && Math.log10
      || base === 2 && Math.log2
      || (base = Math.log(base), function(x) { return Math.log(x) / base; });
}

var t0$1 = new Date;
var t1$1 = new Date;

function newInterval(floori, offseti, count, field) {

  function interval(date) {
    return floori(date = new Date(+date)), date;
  }

  interval.floor = interval;

  interval.ceil = function(date) {
    return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
  };

  interval.round = function(date) {
    var d0 = interval(date),
        d1 = interval.ceil(date);
    return date - d0 < d1 - date ? d0 : d1;
  };

  interval.offset = function(date, step) {
    return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
  };

  interval.range = function(start, stop, step) {
    var range = [];
    start = interval.ceil(start);
    step = step == null ? 1 : Math.floor(step);
    if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
    do range.push(new Date(+start)); while (offseti(start, step), floori(start), start < stop)
    return range;
  };

  interval.filter = function(test) {
    return newInterval(function(date) {
      if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
    }, function(date, step) {
      if (date >= date) while (--step >= 0) while (offseti(date, 1), !test(date)) {} // eslint-disable-line no-empty
    });
  };

  if (count) {
    interval.count = function(start, end) {
      t0$1.setTime(+start), t1$1.setTime(+end);
      floori(t0$1), floori(t1$1);
      return Math.floor(count(t0$1, t1$1));
    };

    interval.every = function(step) {
      step = Math.floor(step);
      return !isFinite(step) || !(step > 0) ? null
          : !(step > 1) ? interval
          : interval.filter(field
              ? function(d) { return field(d) % step === 0; }
              : function(d) { return interval.count(0, d) % step === 0; });
    };
  }

  return interval;
}

var millisecond = newInterval(function() {
  // noop
}, function(date, step) {
  date.setTime(+date + step);
}, function(start, end) {
  return end - start;
});

// An optimized implementation for this simple case.
millisecond.every = function(k) {
  k = Math.floor(k);
  if (!isFinite(k) || !(k > 0)) return null;
  if (!(k > 1)) return millisecond;
  return newInterval(function(date) {
    date.setTime(Math.floor(date / k) * k);
  }, function(date, step) {
    date.setTime(+date + step * k);
  }, function(start, end) {
    return (end - start) / k;
  });
};

var durationSecond$1 = 1e3;
var durationMinute$1 = 6e4;
var durationHour$1 = 36e5;
var durationDay$1 = 864e5;
var durationWeek$1 = 6048e5;

var second = newInterval(function(date) {
  date.setTime(Math.floor(date / durationSecond$1) * durationSecond$1);
}, function(date, step) {
  date.setTime(+date + step * durationSecond$1);
}, function(start, end) {
  return (end - start) / durationSecond$1;
}, function(date) {
  return date.getUTCSeconds();
});

var minute = newInterval(function(date) {
  date.setTime(Math.floor(date / durationMinute$1) * durationMinute$1);
}, function(date, step) {
  date.setTime(+date + step * durationMinute$1);
}, function(start, end) {
  return (end - start) / durationMinute$1;
}, function(date) {
  return date.getMinutes();
});

var hour = newInterval(function(date) {
  var offset = date.getTimezoneOffset() * durationMinute$1 % durationHour$1;
  if (offset < 0) offset += durationHour$1;
  date.setTime(Math.floor((+date - offset) / durationHour$1) * durationHour$1 + offset);
}, function(date, step) {
  date.setTime(+date + step * durationHour$1);
}, function(start, end) {
  return (end - start) / durationHour$1;
}, function(date) {
  return date.getHours();
});

var day = newInterval(function(date) {
  date.setHours(0, 0, 0, 0);
}, function(date, step) {
  date.setDate(date.getDate() + step);
}, function(start, end) {
  return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute$1) / durationDay$1;
}, function(date) {
  return date.getDate() - 1;
});

function weekday(i) {
  return newInterval(function(date) {
    date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setDate(date.getDate() + step * 7);
  }, function(start, end) {
    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute$1) / durationWeek$1;
  });
}

var sunday = weekday(0);
var monday = weekday(1);
var tuesday = weekday(2);
var wednesday = weekday(3);
var thursday = weekday(4);
var friday = weekday(5);
var saturday = weekday(6);

var month = newInterval(function(date) {
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
}, function(date, step) {
  date.setMonth(date.getMonth() + step);
}, function(start, end) {
  return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
}, function(date) {
  return date.getMonth();
});

var year = newInterval(function(date) {
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
}, function(date, step) {
  date.setFullYear(date.getFullYear() + step);
}, function(start, end) {
  return end.getFullYear() - start.getFullYear();
}, function(date) {
  return date.getFullYear();
});

// An optimized implementation for this simple case.
year.every = function(k) {
  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
    date.setFullYear(Math.floor(date.getFullYear() / k) * k);
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setFullYear(date.getFullYear() + step * k);
  });
};

var utcMinute = newInterval(function(date) {
  date.setUTCSeconds(0, 0);
}, function(date, step) {
  date.setTime(+date + step * durationMinute$1);
}, function(start, end) {
  return (end - start) / durationMinute$1;
}, function(date) {
  return date.getUTCMinutes();
});

var utcHour = newInterval(function(date) {
  date.setUTCMinutes(0, 0, 0);
}, function(date, step) {
  date.setTime(+date + step * durationHour$1);
}, function(start, end) {
  return (end - start) / durationHour$1;
}, function(date) {
  return date.getUTCHours();
});

var utcDay = newInterval(function(date) {
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCDate(date.getUTCDate() + step);
}, function(start, end) {
  return (end - start) / durationDay$1;
}, function(date) {
  return date.getUTCDate() - 1;
});

function utcWeekday(i) {
  return newInterval(function(date) {
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCDate(date.getUTCDate() + step * 7);
  }, function(start, end) {
    return (end - start) / durationWeek$1;
  });
}

var utcSunday = utcWeekday(0);
var utcMonday = utcWeekday(1);
var utcTuesday = utcWeekday(2);
var utcWednesday = utcWeekday(3);
var utcThursday = utcWeekday(4);
var utcFriday = utcWeekday(5);
var utcSaturday = utcWeekday(6);

var utcMonth = newInterval(function(date) {
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCMonth(date.getUTCMonth() + step);
}, function(start, end) {
  return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
}, function(date) {
  return date.getUTCMonth();
});

var utcYear = newInterval(function(date) {
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCFullYear(date.getUTCFullYear() + step);
}, function(start, end) {
  return end.getUTCFullYear() - start.getUTCFullYear();
}, function(date) {
  return date.getUTCFullYear();
});

// An optimized implementation for this simple case.
utcYear.every = function(k) {
  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
    date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCFullYear(date.getUTCFullYear() + step * k);
  });
};

function localDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
    date.setFullYear(d.y);
    return date;
  }
  return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}

function utcDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
    date.setUTCFullYear(d.y);
    return date;
  }
  return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
}

function newYear(y) {
  return {y: y, m: 0, d: 1, H: 0, M: 0, S: 0, L: 0};
}

function formatLocale$1(locale) {
  var locale_dateTime = locale.dateTime,
      locale_date = locale.date,
      locale_time = locale.time,
      locale_periods = locale.periods,
      locale_weekdays = locale.days,
      locale_shortWeekdays = locale.shortDays,
      locale_months = locale.months,
      locale_shortMonths = locale.shortMonths;

  var periodRe = formatRe(locale_periods),
      periodLookup = formatLookup(locale_periods),
      weekdayRe = formatRe(locale_weekdays),
      weekdayLookup = formatLookup(locale_weekdays),
      shortWeekdayRe = formatRe(locale_shortWeekdays),
      shortWeekdayLookup = formatLookup(locale_shortWeekdays),
      monthRe = formatRe(locale_months),
      monthLookup = formatLookup(locale_months),
      shortMonthRe = formatRe(locale_shortMonths),
      shortMonthLookup = formatLookup(locale_shortMonths);

  var formats = {
    "a": formatShortWeekday,
    "A": formatWeekday,
    "b": formatShortMonth,
    "B": formatMonth,
    "c": null,
    "d": formatDayOfMonth,
    "e": formatDayOfMonth,
    "H": formatHour24,
    "I": formatHour12,
    "j": formatDayOfYear,
    "L": formatMilliseconds,
    "m": formatMonthNumber,
    "M": formatMinutes,
    "p": formatPeriod,
    "S": formatSeconds,
    "U": formatWeekNumberSunday,
    "w": formatWeekdayNumber,
    "W": formatWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatYear,
    "Y": formatFullYear,
    "Z": formatZone,
    "%": formatLiteralPercent
  };

  var utcFormats = {
    "a": formatUTCShortWeekday,
    "A": formatUTCWeekday,
    "b": formatUTCShortMonth,
    "B": formatUTCMonth,
    "c": null,
    "d": formatUTCDayOfMonth,
    "e": formatUTCDayOfMonth,
    "H": formatUTCHour24,
    "I": formatUTCHour12,
    "j": formatUTCDayOfYear,
    "L": formatUTCMilliseconds,
    "m": formatUTCMonthNumber,
    "M": formatUTCMinutes,
    "p": formatUTCPeriod,
    "S": formatUTCSeconds,
    "U": formatUTCWeekNumberSunday,
    "w": formatUTCWeekdayNumber,
    "W": formatUTCWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatUTCYear,
    "Y": formatUTCFullYear,
    "Z": formatUTCZone,
    "%": formatLiteralPercent
  };

  var parses = {
    "a": parseShortWeekday,
    "A": parseWeekday,
    "b": parseShortMonth,
    "B": parseMonth,
    "c": parseLocaleDateTime,
    "d": parseDayOfMonth,
    "e": parseDayOfMonth,
    "H": parseHour24,
    "I": parseHour24,
    "j": parseDayOfYear,
    "L": parseMilliseconds,
    "m": parseMonthNumber,
    "M": parseMinutes,
    "p": parsePeriod,
    "S": parseSeconds,
    "U": parseWeekNumberSunday,
    "w": parseWeekdayNumber,
    "W": parseWeekNumberMonday,
    "x": parseLocaleDate,
    "X": parseLocaleTime,
    "y": parseYear,
    "Y": parseFullYear,
    "Z": parseZone,
    "%": parseLiteralPercent
  };

  // These recursive directive definitions must be deferred.
  formats.x = newFormat(locale_date, formats);
  formats.X = newFormat(locale_time, formats);
  formats.c = newFormat(locale_dateTime, formats);
  utcFormats.x = newFormat(locale_date, utcFormats);
  utcFormats.X = newFormat(locale_time, utcFormats);
  utcFormats.c = newFormat(locale_dateTime, utcFormats);

  function newFormat(specifier, formats) {
    return function(date) {
      var string = [],
          i = -1,
          j = 0,
          n = specifier.length,
          c,
          pad,
          format;

      if (!(date instanceof Date)) date = new Date(+date);

      while (++i < n) {
        if (specifier.charCodeAt(i) === 37) {
          string.push(specifier.slice(j, i));
          if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
          else pad = c === "e" ? " " : "0";
          if (format = formats[c]) c = format(date, pad);
          string.push(c);
          j = i + 1;
        }
      }

      string.push(specifier.slice(j, i));
      return string.join("");
    };
  }

  function newParse(specifier, newDate) {
    return function(string) {
      var d = newYear(1900),
          i = parseSpecifier(d, specifier, string += "", 0);
      if (i != string.length) return null;

      // The am-pm flag is 0 for AM, and 1 for PM.
      if ("p" in d) d.H = d.H % 12 + d.p * 12;

      // Convert day-of-week and week-of-year to day-of-year.
      if ("W" in d || "U" in d) {
        if (!("w" in d)) d.w = "W" in d ? 1 : 0;
        var day$$1 = "Z" in d ? utcDate(newYear(d.y)).getUTCDay() : newDate(newYear(d.y)).getDay();
        d.m = 0;
        d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day$$1 + 5) % 7 : d.w + d.U * 7 - (day$$1 + 6) % 7;
      }

      // If a time zone is specified, all fields are interpreted as UTC and then
      // offset according to the specified time zone.
      if ("Z" in d) {
        d.H += d.Z / 100 | 0;
        d.M += d.Z % 100;
        return utcDate(d);
      }

      // Otherwise, all fields are in local time.
      return newDate(d);
    };
  }

  function parseSpecifier(d, specifier, string, j) {
    var i = 0,
        n = specifier.length,
        m = string.length,
        c,
        parse;

    while (i < n) {
      if (j >= m) return -1;
      c = specifier.charCodeAt(i++);
      if (c === 37) {
        c = specifier.charAt(i++);
        parse = parses[c in pads ? specifier.charAt(i++) : c];
        if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
      } else if (c != string.charCodeAt(j++)) {
        return -1;
      }
    }

    return j;
  }

  function parsePeriod(d, string, i) {
    var n = periodRe.exec(string.slice(i));
    return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseShortWeekday(d, string, i) {
    var n = shortWeekdayRe.exec(string.slice(i));
    return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseWeekday(d, string, i) {
    var n = weekdayRe.exec(string.slice(i));
    return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseShortMonth(d, string, i) {
    var n = shortMonthRe.exec(string.slice(i));
    return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseMonth(d, string, i) {
    var n = monthRe.exec(string.slice(i));
    return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseLocaleDateTime(d, string, i) {
    return parseSpecifier(d, locale_dateTime, string, i);
  }

  function parseLocaleDate(d, string, i) {
    return parseSpecifier(d, locale_date, string, i);
  }

  function parseLocaleTime(d, string, i) {
    return parseSpecifier(d, locale_time, string, i);
  }

  function formatShortWeekday(d) {
    return locale_shortWeekdays[d.getDay()];
  }

  function formatWeekday(d) {
    return locale_weekdays[d.getDay()];
  }

  function formatShortMonth(d) {
    return locale_shortMonths[d.getMonth()];
  }

  function formatMonth(d) {
    return locale_months[d.getMonth()];
  }

  function formatPeriod(d) {
    return locale_periods[+(d.getHours() >= 12)];
  }

  function formatUTCShortWeekday(d) {
    return locale_shortWeekdays[d.getUTCDay()];
  }

  function formatUTCWeekday(d) {
    return locale_weekdays[d.getUTCDay()];
  }

  function formatUTCShortMonth(d) {
    return locale_shortMonths[d.getUTCMonth()];
  }

  function formatUTCMonth(d) {
    return locale_months[d.getUTCMonth()];
  }

  function formatUTCPeriod(d) {
    return locale_periods[+(d.getUTCHours() >= 12)];
  }

  return {
    format: function(specifier) {
      var f = newFormat(specifier += "", formats);
      f.toString = function() { return specifier; };
      return f;
    },
    parse: function(specifier) {
      var p = newParse(specifier += "", localDate);
      p.toString = function() { return specifier; };
      return p;
    },
    utcFormat: function(specifier) {
      var f = newFormat(specifier += "", utcFormats);
      f.toString = function() { return specifier; };
      return f;
    },
    utcParse: function(specifier) {
      var p = newParse(specifier, utcDate);
      p.toString = function() { return specifier; };
      return p;
    }
  };
}

var pads = {"-": "", "_": " ", "0": "0"};
var numberRe = /^\s*\d+/;
var percentRe = /^%/;
var requoteRe = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;

function pad(value, fill, width) {
  var sign = value < 0 ? "-" : "",
      string = (sign ? -value : value) + "",
      length = string.length;
  return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
}

function requote(s) {
  return s.replace(requoteRe, "\\$&");
}

function formatRe(names) {
  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
}

function formatLookup(names) {
  var map = {}, i = -1, n = names.length;
  while (++i < n) map[names[i].toLowerCase()] = i;
  return map;
}

function parseWeekdayNumber(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.w = +n[0], i + n[0].length) : -1;
}

function parseWeekNumberSunday(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.U = +n[0], i + n[0].length) : -1;
}

function parseWeekNumberMonday(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.W = +n[0], i + n[0].length) : -1;
}

function parseFullYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 4));
  return n ? (d.y = +n[0], i + n[0].length) : -1;
}

function parseYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
}

function parseZone(d, string, i) {
  var n = /^(Z)|([+-]\d\d)(?:\:?(\d\d))?/.exec(string.slice(i, i + 6));
  return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
}

function parseMonthNumber(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
}

function parseDayOfMonth(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.d = +n[0], i + n[0].length) : -1;
}

function parseDayOfYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
}

function parseHour24(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.H = +n[0], i + n[0].length) : -1;
}

function parseMinutes(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.M = +n[0], i + n[0].length) : -1;
}

function parseSeconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.S = +n[0], i + n[0].length) : -1;
}

function parseMilliseconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.L = +n[0], i + n[0].length) : -1;
}

function parseLiteralPercent(d, string, i) {
  var n = percentRe.exec(string.slice(i, i + 1));
  return n ? i + n[0].length : -1;
}

function formatDayOfMonth(d, p) {
  return pad(d.getDate(), p, 2);
}

function formatHour24(d, p) {
  return pad(d.getHours(), p, 2);
}

function formatHour12(d, p) {
  return pad(d.getHours() % 12 || 12, p, 2);
}

function formatDayOfYear(d, p) {
  return pad(1 + day.count(year(d), d), p, 3);
}

function formatMilliseconds(d, p) {
  return pad(d.getMilliseconds(), p, 3);
}

function formatMonthNumber(d, p) {
  return pad(d.getMonth() + 1, p, 2);
}

function formatMinutes(d, p) {
  return pad(d.getMinutes(), p, 2);
}

function formatSeconds(d, p) {
  return pad(d.getSeconds(), p, 2);
}

function formatWeekNumberSunday(d, p) {
  return pad(sunday.count(year(d), d), p, 2);
}

function formatWeekdayNumber(d) {
  return d.getDay();
}

function formatWeekNumberMonday(d, p) {
  return pad(monday.count(year(d), d), p, 2);
}

function formatYear(d, p) {
  return pad(d.getFullYear() % 100, p, 2);
}

function formatFullYear(d, p) {
  return pad(d.getFullYear() % 10000, p, 4);
}

function formatZone(d) {
  var z = d.getTimezoneOffset();
  return (z > 0 ? "-" : (z *= -1, "+"))
      + pad(z / 60 | 0, "0", 2)
      + pad(z % 60, "0", 2);
}

function formatUTCDayOfMonth(d, p) {
  return pad(d.getUTCDate(), p, 2);
}

function formatUTCHour24(d, p) {
  return pad(d.getUTCHours(), p, 2);
}

function formatUTCHour12(d, p) {
  return pad(d.getUTCHours() % 12 || 12, p, 2);
}

function formatUTCDayOfYear(d, p) {
  return pad(1 + utcDay.count(utcYear(d), d), p, 3);
}

function formatUTCMilliseconds(d, p) {
  return pad(d.getUTCMilliseconds(), p, 3);
}

function formatUTCMonthNumber(d, p) {
  return pad(d.getUTCMonth() + 1, p, 2);
}

function formatUTCMinutes(d, p) {
  return pad(d.getUTCMinutes(), p, 2);
}

function formatUTCSeconds(d, p) {
  return pad(d.getUTCSeconds(), p, 2);
}

function formatUTCWeekNumberSunday(d, p) {
  return pad(utcSunday.count(utcYear(d), d), p, 2);
}

function formatUTCWeekdayNumber(d) {
  return d.getUTCDay();
}

function formatUTCWeekNumberMonday(d, p) {
  return pad(utcMonday.count(utcYear(d), d), p, 2);
}

function formatUTCYear(d, p) {
  return pad(d.getUTCFullYear() % 100, p, 2);
}

function formatUTCFullYear(d, p) {
  return pad(d.getUTCFullYear() % 10000, p, 4);
}

function formatUTCZone() {
  return "+0000";
}

function formatLiteralPercent() {
  return "%";
}

var locale$2;
var timeFormat;
var timeParse;
var utcFormat;
var utcParse;

defaultLocale$1({
  dateTime: "%x, %X",
  date: "%-m/%-d/%Y",
  time: "%-I:%M:%S %p",
  periods: ["AM", "PM"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});

function defaultLocale$1(definition) {
  locale$2 = formatLocale$1(definition);
  timeFormat = locale$2.format;
  timeParse = locale$2.parse;
  utcFormat = locale$2.utcFormat;
  utcParse = locale$2.utcParse;
  return locale$2;
}

var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

function formatIsoNative(date) {
  return date.toISOString();
}

var formatIso = Date.prototype.toISOString
    ? formatIsoNative
    : utcFormat(isoSpecifier);

function parseIsoNative(string) {
  var date = new Date(string);
  return isNaN(date) ? null : date;
}

var parseIso = +new Date("2000-01-01T00:00:00.000Z")
    ? parseIsoNative
    : utcParse(isoSpecifier);

var colors = function(s) {
  return s.match(/.{6}/g).map(function(x) {
    return "#" + x;
  });
};

colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

colors("393b795254a36b6ecf9c9ede6379398ca252b5cf6bcedb9c8c6d31bd9e39e7ba52e7cb94843c39ad494ad6616be7969c7b4173a55194ce6dbdde9ed6");

colors("3182bd6baed69ecae1c6dbefe6550dfd8d3cfdae6bfdd0a231a35474c476a1d99bc7e9c0756bb19e9ac8bcbddcdadaeb636363969696bdbdbdd9d9d9");

colors("1f77b4aec7e8ff7f0effbb782ca02c98df8ad62728ff98969467bdc5b0d58c564bc49c94e377c2f7b6d27f7f7fc7c7c7bcbd22dbdb8d17becf9edae5");

cubehelixLong(cubehelix(300, 0.5, 0.0), cubehelix(-240, 0.5, 1.0));

var warm = cubehelixLong(cubehelix(-100, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

var cool = cubehelixLong(cubehelix(260, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

var rainbow = cubehelix();

function appendNode ( node, target ) {
	target.appendChild( node );
}

function insertNode ( node, target, anchor ) {
	target.insertBefore( node, anchor );
}

function detachNode ( node ) {
	node.parentNode.removeChild( node );
}

function teardownEach ( iterations, detach, start ) {
	for ( var i = ( start || 0 ); i < iterations.length; i += 1 ) {
		iterations[i].teardown( detach );
	}
}

function createElement ( name ) {
	return document.createElement( name );
}

function createSvgElement ( name ) {
	return document.createElementNS( 'http://www.w3.org/2000/svg', name );
}

function createText ( data ) {
	return document.createTextNode( data );
}

function createComment () {
	return document.createComment( '' );
}

function setAttribute ( node, attribute, value ) {
	node.setAttribute ( attribute, value );
}

function get ( key ) {
	return key ? this._state[ key ] : this._state;
}

function fire ( eventName, data ) {
	var handlers = eventName in this._handlers && this._handlers[ eventName ].slice();
	if ( !handlers ) return;

	for ( var i = 0; i < handlers.length; i += 1 ) {
		handlers[i].call( this, data );
	}
}

function observe ( key, callback, options ) {
	var group = ( options && options.defer ) ? this._observers.pre : this._observers.post;

	( group[ key ] || ( group[ key ] = [] ) ).push( callback );

	if ( !options || options.init !== false ) {
		callback.__calling = true;
		callback.call( this, this._state[ key ] );
		callback.__calling = false;
	}

	return {
		cancel: function () {
			var index = group[ key ].indexOf( callback );
			if ( ~index ) group[ key ].splice( index, 1 );
		}
	};
}

function on ( eventName, handler ) {
	var handlers = this._handlers[ eventName ] || ( this._handlers[ eventName ] = [] );
	handlers.push( handler );

	return {
		cancel: function () {
			var index = handlers.indexOf( handler );
			if ( ~index ) handlers.splice( index, 1 );
		}
	};
}

function set$2 ( newState ) {
	this._set( newState );
	( this._root || this )._flush();
}

function _flush () {
	if ( !this._renderHooks ) return;

	while ( this._renderHooks.length ) {
		var hook = this._renderHooks.pop();
		hook.fn.call( hook.context );
	}
}

function dispatchObservers ( component, group, newState, oldState ) {
	for ( var key in group ) {
		if ( !( key in newState ) ) continue;

		var newValue = newState[ key ];
		var oldValue = oldState[ key ];

		if ( newValue === oldValue && typeof newValue !== 'object' ) continue;

		var callbacks = group[ key ];
		if ( !callbacks ) continue;

		for ( var i = 0; i < callbacks.length; i += 1 ) {
			var callback = callbacks[i];
			if ( callback.__calling ) continue;

			callback.__calling = true;
			callback.call( component, newValue, oldValue );
			callback.__calling = false;
		}
	}
}

function applyComputations ( state, newState, oldState, isInitial ) {
	if ( isInitial || ( 'padding' in newState && typeof state.padding === 'object' || state.padding !== oldState.padding ) || ( 'height' in newState && typeof state.height === 'object' || state.height !== oldState.height ) || ( 'yTicks' in newState && typeof state.yTicks === 'object' || state.yTicks !== oldState.yTicks ) ) {
		state.yScale = newState.yScale = template$1.computed.yScale( state.padding, state.height, state.yTicks );
	}
	
	if ( isInitial || ( 'padding' in newState && typeof state.padding === 'object' || state.padding !== oldState.padding ) || ( 'width' in newState && typeof state.width === 'object' || state.width !== oldState.width ) || ( 'xTicks' in newState && typeof state.xTicks === 'object' || state.xTicks !== oldState.xTicks ) ) {
		state.xScale = newState.xScale = template$1.computed.xScale( state.padding, state.width, state.xTicks );
	}
	
	if ( isInitial || ( 'projects' in newState && typeof state.projects === 'object' || state.projects !== oldState.projects ) || ( 'xScale' in newState && typeof state.xScale === 'object' || state.xScale !== oldState.xScale ) || ( 'yScale' in newState && typeof state.yScale === 'object' || state.yScale !== oldState.yScale ) ) {
		state.path = newState.path = template$1.computed.path( state.projects, state.xScale, state.yScale );
	}
}

var template$1 = (function () {
	return {
		data () {
			return {
				padding: {
					top: 20,
					right: 15,
					bottom: 20,
					left: 25
				},
				height: 200,
				width: 300,
				foo: 'bar',
				yTicks:  [0, 5, 10, 15, 20 ],
				xTicks: [1990, 1995, 2000, 2005, 2010, 2015],
				formatMobile ( tick ) {
					return '\'' + tick.toString().slice(-2);
				}
			};
		},
		computed: {
			yScale: function ( padding, height, yTicks ) {
				return linear()
					.domain([Math.min.apply(null, yTicks), Math.max.apply(null, yTicks)])
   					.range([height - padding.bottom, padding.top]);
			},
			xScale: function ( padding, width, xTicks ) {
				return linear()
					.domain([Math.min.apply(null, xTicks), Math.max.apply(null, xTicks)])
   					.range([padding.left, width - padding.right]);
			},
			path ( projects, xScale, yScale ) {
				
				var path = '';

				// make path
				projects.forEach(function (datapoint, i) {
					var year = datapoint.year;

					if (i === 0) {
						path = 'M' + xScale(year) + ' ' + yScale(datapoint.birthrate_all) + ' ';
					} else {
						path += 'L ' + xScale(year) + ' ' + yScale(datapoint.birthrate_all) + ' ';
					}
				});
			
				return path;
			}
		},
		onrender () {

			this.container = this.refs.svg;
		
			var self = this;

			window.addEventListener( 'resize', function () {
				self.resize();
			});

			this.resize();			
		},
		methods: {
			resize () {
				this.set({
					width: this.container.getBoundingClientRect().width,
					height: this.container.getBoundingClientRect().height
				});
			}
		}
	};
}());

let addedCss$1 = false;
function addCss$1 () {
	var style = createElement( 'style' );
	style.textContent = "\n\n\t.path-line[svelte-3925398482], [svelte-3925398482] .path-line {\n\t\tfill: none;\n\t\tstroke: #fb0;\n\t\tstroke-linejoin: round;\n\t\tstroke-linecap: round;\n\t\tstroke-width: 2; \n\t}\n";
	appendNode( style, document.head );

	addedCss$1 = true;
}

function renderMainFragment$1 ( root, component ) {
	var h2 = createElement( 'h2' );
	setAttribute( h2, 'svelte-3925398482', '' );
	
	appendNode( createText( "Line" ), h2 );
	var text1 = createText( "\n\n" );
	
	var svg = createSvgElement( 'svg' );
	setAttribute( svg, 'svelte-3925398482', '' );
	component.refs.svg = svg;
	
	var g = createSvgElement( 'g' );
	setAttribute( g, 'svelte-3925398482', '' );
	setAttribute( g, 'class', "line" );
	
	appendNode( g, svg );
	var ifBlock_anchor = createComment();
	appendNode( ifBlock_anchor, g );
	
	function getBlock ( root ) {
		if ( root.ready ) return renderIfBlock_0$1;
		return null;
	}
	
	var currentBlock = getBlock( root );
	var ifBlock = currentBlock && currentBlock( root, component );
	
	if ( ifBlock ) ifBlock.mount( ifBlock_anchor.parentNode, ifBlock_anchor );

	return {
		mount: function ( target, anchor ) {
			insertNode( h2, target, anchor );
			insertNode( text1, target, anchor );
			insertNode( svg, target, anchor );
		},
		
		update: function ( changed, root ) {
			var _currentBlock = currentBlock;
			currentBlock = getBlock( root );
			if ( _currentBlock === currentBlock && ifBlock) {
				ifBlock.update( changed, root );
			} else {
				if ( ifBlock ) ifBlock.teardown( true );
				ifBlock = currentBlock && currentBlock( root, component );
				if ( ifBlock ) ifBlock.mount( ifBlock_anchor.parentNode, ifBlock_anchor );
			}
		},
		
		teardown: function ( detach ) {
			if ( component.refs.svg === svg ) component.refs.svg = null;
			if ( ifBlock ) ifBlock.teardown( false );
			
			if ( detach ) {
				detachNode( h2 );
				detachNode( text1 );
				detachNode( svg );
			}
		}
	};
}

function renderIfBlock_0$1 ( root, component ) {
	var g = createSvgElement( 'g' );
	setAttribute( g, 'svelte-3925398482', '' );
	setAttribute( g, 'transform', "translate(0,0)" );
	
	var g1 = createSvgElement( 'g' );
	setAttribute( g1, 'svelte-3925398482', '' );
	setAttribute( g1, 'class', "axes" );
	
	appendNode( g1, g );
	
	var g2 = createSvgElement( 'g' );
	setAttribute( g2, 'svelte-3925398482', '' );
	setAttribute( g2, 'class', "axis y-axis" );
	setAttribute( g2, 'transform', "translate(0, " + ( root.padding.top ) + " )" );
	
	appendNode( g2, g1 );
	var eachBlock_anchor = createComment();
	appendNode( eachBlock_anchor, g2 );
	var eachBlock_value = root.yTicks;
	var eachBlock_iterations = [];
	
	for ( var i = 0; i < eachBlock_value.length; i += 1 ) {
		eachBlock_iterations[i] = renderEachBlock( root, eachBlock_value, eachBlock_value[i], i, component );
		eachBlock_iterations[i].mount( eachBlock_anchor.parentNode, eachBlock_anchor );
	}
	
	var g3 = createSvgElement( 'g' );
	setAttribute( g3, 'svelte-3925398482', '' );
	setAttribute( g3, 'class', "axis x-axis" );
	
	appendNode( g3, g1 );
	var eachBlock1_anchor = createComment();
	appendNode( eachBlock1_anchor, g3 );
	var eachBlock1_value = root.xTicks;
	var eachBlock1_iterations = [];
	
	for ( var i1 = 0; i1 < eachBlock1_value.length; i1 += 1 ) {
		eachBlock1_iterations[i1] = renderEachBlock1( root, eachBlock1_value, eachBlock1_value[i1], i1, component );
		eachBlock1_iterations[i1].mount( eachBlock1_anchor.parentNode, eachBlock1_anchor );
	}
	
	var path = createSvgElement( 'path' );
	setAttribute( path, 'svelte-3925398482', '' );
	setAttribute( path, 'class', "path-line" );
	setAttribute( path, 'd', root.path );

	return {
		mount: function ( target, anchor ) {
			insertNode( g, target, anchor );
			insertNode( path, target, anchor );
		},
		
		update: function ( changed, root ) {
			setAttribute( g2, 'transform', "translate(0, " + ( root.padding.top ) + " )" );
			
			var eachBlock_value = root.yTicks;
			
			for ( var i = 0; i < eachBlock_value.length; i += 1 ) {
				if ( !eachBlock_iterations[i] ) {
					eachBlock_iterations[i] = renderEachBlock( root, eachBlock_value, eachBlock_value[i], i, component );
					eachBlock_iterations[i].mount( eachBlock_anchor.parentNode, eachBlock_anchor );
				} else {
					eachBlock_iterations[i].update( changed, root, eachBlock_value, eachBlock_value[i], i );
				}
			}
			
			teardownEach( eachBlock_iterations, true, eachBlock_value.length );
			
			eachBlock_iterations.length = eachBlock_value.length;
			
			var eachBlock1_value = root.xTicks;
			
			for ( var i1 = 0; i1 < eachBlock1_value.length; i1 += 1 ) {
				if ( !eachBlock1_iterations[i1] ) {
					eachBlock1_iterations[i1] = renderEachBlock1( root, eachBlock1_value, eachBlock1_value[i1], i1, component );
					eachBlock1_iterations[i1].mount( eachBlock1_anchor.parentNode, eachBlock1_anchor );
				} else {
					eachBlock1_iterations[i1].update( changed, root, eachBlock1_value, eachBlock1_value[i1], i1 );
				}
			}
			
			teardownEach( eachBlock1_iterations, true, eachBlock1_value.length );
			
			eachBlock1_iterations.length = eachBlock1_value.length;
			
			setAttribute( path, 'd', root.path );
		},
		
		teardown: function ( detach ) {
			teardownEach( eachBlock_iterations, false );
			
			teardownEach( eachBlock1_iterations, false );
			
			if ( detach ) {
				detachNode( g );
				detachNode( path );
			}
		}
	};
}

function renderEachBlock1 ( root, eachBlock1_value, tick, tick__index, component ) {
	var g = createSvgElement( 'g' );
	setAttribute( g, 'svelte-3925398482', '' );
	setAttribute( g, 'class', "tick tick-" + ( tick ) );
	setAttribute( g, 'transform', "translate( " + ( root.xScale(tick) ) + ", " + ( root.height ) + " )" );
	
	var ifBlock1_anchor = createComment();
	appendNode( ifBlock1_anchor, g );
	
	function getBlock1 ( root, eachBlock1_value, tick, tick__index ) {
		if ( root.width > 380 ) return renderIfBlock1_0;
		return renderIfBlock1_1;
	}
	
	var currentBlock1 = getBlock1( root, eachBlock1_value, tick, tick__index );
	var ifBlock1 = currentBlock1 && currentBlock1( root, eachBlock1_value, tick, tick__index, component );
	
	if ( ifBlock1 ) ifBlock1.mount( ifBlock1_anchor.parentNode, ifBlock1_anchor );

	return {
		mount: function ( target, anchor ) {
			insertNode( g, target, anchor );
		},
		
		update: function ( changed, root, eachBlock1_value, tick, tick__index ) {
			setAttribute( g, 'class', "tick tick-" + ( tick ) );
			setAttribute( g, 'transform', "translate( " + ( root.xScale(tick) ) + ", " + ( root.height ) + " )" );
			
			var _currentBlock1 = currentBlock1;
			currentBlock1 = getBlock1( root, eachBlock1_value, tick, tick__index );
			if ( _currentBlock1 === currentBlock1 && ifBlock1) {
				ifBlock1.update( changed, root, eachBlock1_value, tick, tick__index );
			} else {
				if ( ifBlock1 ) ifBlock1.teardown( true );
				ifBlock1 = currentBlock1 && currentBlock1( root, eachBlock1_value, tick, tick__index, component );
				if ( ifBlock1 ) ifBlock1.mount( ifBlock1_anchor.parentNode, ifBlock1_anchor );
			}
		},
		
		teardown: function ( detach ) {
			if ( ifBlock1 ) ifBlock1.teardown( false );
			
			if ( detach ) {
				detachNode( g );
			}
		}
	};
}

function renderIfBlock1_1 ( root, eachBlock1_value, tick, tick__index, component ) {
	var text = createSvgElement( 'text' );
	setAttribute( text, 'svelte-3925398482', '' );
	setAttribute( text, 'fill', "#000" );
	setAttribute( text, 'x', "0" );
	setAttribute( text, 'y', "0" );
	setAttribute( text, 'dy', "-2" );
	
	var text1 = createText( root.formatMobile(tick) );
	appendNode( text1, text );

	return {
		mount: function ( target, anchor ) {
			insertNode( text, target, anchor );
		},
		
		update: function ( changed, root, eachBlock1_value, tick, tick__index ) {
			text1.data = root.formatMobile(tick);
		},
		
		teardown: function ( detach ) {
			if ( detach ) {
				detachNode( text );
			}
		}
	};
}

function renderIfBlock1_0 ( root, eachBlock1_value, tick, tick__index, component ) {
	var text = createSvgElement( 'text' );
	setAttribute( text, 'svelte-3925398482', '' );
	setAttribute( text, 'fill', "#000" );
	setAttribute( text, 'x', "0" );
	setAttribute( text, 'y', "0" );
	setAttribute( text, 'dy', "-2" );
	
	var text1 = createText( tick );
	appendNode( text1, text );

	return {
		mount: function ( target, anchor ) {
			insertNode( text, target, anchor );
		},
		
		update: function ( changed, root, eachBlock1_value, tick, tick__index ) {
			text1.data = tick;
		},
		
		teardown: function ( detach ) {
			if ( detach ) {
				detachNode( text );
			}
		}
	};
}

function renderEachBlock ( root, eachBlock_value, tick, tick__index, component ) {
	var g = createSvgElement( 'g' );
	setAttribute( g, 'svelte-3925398482', '' );
	setAttribute( g, 'class', "tick tick-" + ( tick ) );
	setAttribute( g, 'transform', "translate( 0, " + ( root.yScale(tick) - root.padding.bottom ) + " )" );
	
	var line = createSvgElement( 'line' );
	setAttribute( line, 'svelte-3925398482', '' );
	setAttribute( line, 'stroke', "#000" );
	setAttribute( line, 'x2', "100%" );
	setAttribute( line, 'y1', "0" );
	setAttribute( line, 'y2', "0" );
	
	appendNode( line, g );
	
	var text = createSvgElement( 'text' );
	setAttribute( text, 'svelte-3925398482', '' );
	setAttribute( text, 'fill', "#000" );
	setAttribute( text, 'x', "0" );
	setAttribute( text, 'y', "0" );
	setAttribute( text, 'dy', "-2" );
	
	appendNode( text, g );
	var text1 = createText( tick !== 0 ? tick : '' );
	appendNode( text1, text );
	var text2 = createText( tick === 20 ? ' per 1,000 population' : '' );
	appendNode( text2, text );

	return {
		mount: function ( target, anchor ) {
			insertNode( g, target, anchor );
		},
		
		update: function ( changed, root, eachBlock_value, tick, tick__index ) {
			setAttribute( g, 'class', "tick tick-" + ( tick ) );
			setAttribute( g, 'transform', "translate( 0, " + ( root.yScale(tick) - root.padding.bottom ) + " )" );
			
			text1.data = tick !== 0 ? tick : '';
			
			text2.data = tick === 20 ? ' per 1,000 population' : '';
		},
		
		teardown: function ( detach ) {
			if ( detach ) {
				detachNode( g );
			}
		}
	};
}

function Line ( options ) {
	options = options || {};
	
	this.refs = {};
	this._state = Object.assign( template$1.data(), options.data );
applyComputations( this._state, this._state, {}, true );

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root;
	this._yield = options._yield;

	if ( !addedCss$1 ) addCss$1();
	
	this._fragment = renderMainFragment$1( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );
	
	if ( options._root ) {
		options._root._renderHooks.push({ fn: template$1.onrender, context: this });
	} else {
		template$1.onrender.call( this );
	}
}

Line.prototype = template$1.methods;

Line.prototype.get = get;
Line.prototype.fire = fire;
Line.prototype.observe = observe;
Line.prototype.on = on;
Line.prototype.set = set$2;
Line.prototype._flush = _flush;

Line.prototype._set = function _set ( newState ) {
	var oldState = this._state;
	this._state = Object.assign( {}, oldState, newState );
	applyComputations( this._state, newState, oldState, false );
	
	dispatchObservers( this, this._observers.pre, newState, oldState );
	if ( this._fragment ) this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

Line.prototype.teardown = function teardown ( detach ) {
	this.fire( 'teardown' );

	this._fragment.teardown( detach !== false );
	this._fragment = null;

	this._state = {};
};

function renderMainFragment$3 ( root, component ) {
	var p = createElement( 'p' );
	
	appendNode( createText( "foo is " ), p );
	var text1 = createText( root.foo );
	appendNode( text1, p );

	return {
		mount: function ( target, anchor ) {
			insertNode( p, target, anchor );
		},
		
		update: function ( changed, root ) {
			text1.data = root.foo;
		},
		
		teardown: function ( detach ) {
			if ( detach ) {
				detachNode( p );
			}
		}
	};
}

function Nested ( options ) {
	options = options || {};
	
	this._state = options.data || {};

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root;
	this._yield = options._yield;

	this._fragment = renderMainFragment$3( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );
}

Nested.prototype.get = get;
Nested.prototype.fire = fire;
Nested.prototype.observe = observe;
Nested.prototype.on = on;
Nested.prototype.set = set$2;
Nested.prototype._flush = _flush;

Nested.prototype._set = function _set ( newState ) {
	var oldState = this._state;
	this._state = Object.assign( {}, oldState, newState );
	
	dispatchObservers( this, this._observers.pre, newState, oldState );
	if ( this._fragment ) this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

Nested.prototype.teardown = function teardown ( detach ) {
	this.fire( 'teardown' );

	this._fragment.teardown( detach !== false );
	this._fragment = null;

	this._state = {};
};

function applyComputations$1 ( state, newState, oldState, isInitial ) {
	if ( isInitial || ( 'padding' in newState && typeof state.padding === 'object' || state.padding !== oldState.padding ) || ( 'height' in newState && typeof state.height === 'object' || state.height !== oldState.height ) || ( 'yTicks' in newState && typeof state.yTicks === 'object' || state.yTicks !== oldState.yTicks ) ) {
		state.yScale = newState.yScale = template$2.computed.yScale( state.padding, state.height, state.yTicks );
	}
	
	if ( isInitial || ( 'padding' in newState && typeof state.padding === 'object' || state.padding !== oldState.padding ) || ( 'width' in newState && typeof state.width === 'object' || state.width !== oldState.width ) || ( 'xTicks' in newState && typeof state.xTicks === 'object' || state.xTicks !== oldState.xTicks ) ) {
		state.xScale = newState.xScale = template$2.computed.xScale( state.padding, state.width, state.xTicks );
	}
	
	if ( isInitial || ( 'projects' in newState && typeof state.projects === 'object' || state.projects !== oldState.projects ) || ( 'xScale' in newState && typeof state.xScale === 'object' || state.xScale !== oldState.xScale ) || ( 'yScale' in newState && typeof state.yScale === 'object' || state.yScale !== oldState.yScale ) ) {
		state.areaPath = newState.areaPath = template$2.computed.areaPath( state.projects, state.xScale, state.yScale );
	}
}

var template$2 = (function () {
	return {
		data () {
			return {
				padding: {
					top: 20,
					right: 15,
					bottom: 20,
					left: 25
				},
				height: 200,
				width: 300,
				foo: 'bar',
				yTicks:  [0, 5, 10, 15, 20 ],
				xTicks: [1990, 1995, 2000, 2005, 2010, 2015],
				formatMobile ( tick ) {
					return '\'' + tick.toString().slice(-2);
				}
			};
		},
		components: {
			Nested
		},
		computed: {
			yScale: function ( padding, height, yTicks ) {
				return linear()
					.domain([Math.min.apply(null, yTicks), Math.max.apply(null, yTicks)])
   					.range([height - padding.bottom, padding.top]);
			},
			xScale: function ( padding, width, xTicks ) {
				return linear()
					.domain([Math.min.apply(null, xTicks), Math.max.apply(null, xTicks)])
   					.range([padding.left, width - padding.right]);
			},
			areaPath ( projects, xScale, yScale ) {
				
				var path = '';
				var years = [];
				var initialpoint;

				// make path
				projects.forEach(function (datapoint, i) {
					var year = datapoint.year;
					years.push(year);

					if (i === 0) {
						path = 'M' + xScale(year) + ' ' + yScale(datapoint.birthrate_all) + ' ';
						initialpoint = 'L ' + xScale(year) + ' ' + yScale(datapoint.birthrate_all) + ' ';
					} else {
						path += 'L ' + xScale(year) + ' ' + yScale(datapoint.birthrate_all) + ' ';
					}
				});

				path += 'L ' + xScale(years[years.length-1]) + ' ' + yScale(0) + ' ' + 'L ' + xScale(years[0]) + ' ' + yScale(0) + ' ';
			
				return path;
			}
		},
		onrender () {

			this.container = this.refs.svg;
		
			var self = this;

			window.addEventListener( 'resize', function () {
				self.resize();
			});

			this.resize();			
		},
		methods: {
			resize () {
				this.set({
					width: this.container.getBoundingClientRect().width,
					height: this.container.getBoundingClientRect().height
				});
			}
		}

	};
}());

let addedCss$2 = false;
function addCss$2 () {
	var style = createElement( 'style' );
	style.textContent = "\n\t.path-area[svelte-2649709840], [svelte-2649709840] .path-area {\n\t\tfill: #fb0;\n\t\tstroke: transparent;\n\t\tstroke-linejoin: round;\n\t\tstroke-linecap: round;\n\t\tstroke-width: 2; \n\t\topacity: 0.5;\n\t}\n";
	appendNode( style, document.head );

	addedCss$2 = true;
}

function renderMainFragment$2 ( root, component ) {
	var h2 = createElement( 'h2' );
	setAttribute( h2, 'svelte-2649709840', '' );
	
	appendNode( createText( "Area" ), h2 );
	var text1 = createText( "\n\n" );
	
	var svg = createSvgElement( 'svg' );
	setAttribute( svg, 'svelte-2649709840', '' );
	component.refs.svg = svg;
	
	var g = createSvgElement( 'g' );
	setAttribute( g, 'svelte-2649709840', '' );
	setAttribute( g, 'class', "area" );
	
	appendNode( g, svg );
	var ifBlock_anchor = createComment();
	appendNode( ifBlock_anchor, g );
	
	function getBlock ( root ) {
		if ( root.ready ) return renderIfBlock_0$2;
		return null;
	}
	
	var currentBlock = getBlock( root );
	var ifBlock = currentBlock && currentBlock( root, component );
	
	if ( ifBlock ) ifBlock.mount( ifBlock_anchor.parentNode, ifBlock_anchor );
	var text2 = createText( "\n\n" );

	return {
		mount: function ( target, anchor ) {
			insertNode( h2, target, anchor );
			insertNode( text1, target, anchor );
			insertNode( svg, target, anchor );
			insertNode( text2, target, anchor );
		},
		
		update: function ( changed, root ) {
			var _currentBlock = currentBlock;
			currentBlock = getBlock( root );
			if ( _currentBlock === currentBlock && ifBlock) {
				ifBlock.update( changed, root );
			} else {
				if ( ifBlock ) ifBlock.teardown( true );
				ifBlock = currentBlock && currentBlock( root, component );
				if ( ifBlock ) ifBlock.mount( ifBlock_anchor.parentNode, ifBlock_anchor );
			}
		},
		
		teardown: function ( detach ) {
			if ( component.refs.svg === svg ) component.refs.svg = null;
			if ( ifBlock ) ifBlock.teardown( false );
			
			if ( detach ) {
				detachNode( h2 );
				detachNode( text1 );
				detachNode( svg );
				detachNode( text2 );
			}
		}
	};
}

function renderIfBlock_0$2 ( root, component ) {
	var g = createSvgElement( 'g' );
	setAttribute( g, 'svelte-2649709840', '' );
	setAttribute( g, 'transform', "translate(0,0)" );
	
	var g1 = createSvgElement( 'g' );
	setAttribute( g1, 'svelte-2649709840', '' );
	setAttribute( g1, 'class', "axes" );
	
	appendNode( g1, g );
	
	var g2 = createSvgElement( 'g' );
	setAttribute( g2, 'svelte-2649709840', '' );
	setAttribute( g2, 'class', "axis y-axis" );
	setAttribute( g2, 'transform', "translate(0, " + ( root.padding.top ) + " )" );
	
	appendNode( g2, g1 );
	var eachBlock_anchor = createComment();
	appendNode( eachBlock_anchor, g2 );
	var eachBlock_value = root.yTicks;
	var eachBlock_iterations = [];
	
	for ( var i = 0; i < eachBlock_value.length; i += 1 ) {
		eachBlock_iterations[i] = renderEachBlock$1( root, eachBlock_value, eachBlock_value[i], i, component );
		eachBlock_iterations[i].mount( eachBlock_anchor.parentNode, eachBlock_anchor );
	}
	
	var g3 = createSvgElement( 'g' );
	setAttribute( g3, 'svelte-2649709840', '' );
	setAttribute( g3, 'class', "axis x-axis" );
	
	appendNode( g3, g1 );
	var eachBlock1_anchor = createComment();
	appendNode( eachBlock1_anchor, g3 );
	var eachBlock1_value = root.xTicks;
	var eachBlock1_iterations = [];
	
	for ( var i1 = 0; i1 < eachBlock1_value.length; i1 += 1 ) {
		eachBlock1_iterations[i1] = renderEachBlock1$1( root, eachBlock1_value, eachBlock1_value[i1], i1, component );
		eachBlock1_iterations[i1].mount( eachBlock1_anchor.parentNode, eachBlock1_anchor );
	}
	
	var path = createSvgElement( 'path' );
	setAttribute( path, 'svelte-2649709840', '' );
	setAttribute( path, 'class', "path-area" );
	setAttribute( path, 'd', root.areaPath );

	return {
		mount: function ( target, anchor ) {
			insertNode( g, target, anchor );
			insertNode( path, target, anchor );
		},
		
		update: function ( changed, root ) {
			setAttribute( g2, 'transform', "translate(0, " + ( root.padding.top ) + " )" );
			
			var eachBlock_value = root.yTicks;
			
			for ( var i = 0; i < eachBlock_value.length; i += 1 ) {
				if ( !eachBlock_iterations[i] ) {
					eachBlock_iterations[i] = renderEachBlock$1( root, eachBlock_value, eachBlock_value[i], i, component );
					eachBlock_iterations[i].mount( eachBlock_anchor.parentNode, eachBlock_anchor );
				} else {
					eachBlock_iterations[i].update( changed, root, eachBlock_value, eachBlock_value[i], i );
				}
			}
			
			teardownEach( eachBlock_iterations, true, eachBlock_value.length );
			
			eachBlock_iterations.length = eachBlock_value.length;
			
			var eachBlock1_value = root.xTicks;
			
			for ( var i1 = 0; i1 < eachBlock1_value.length; i1 += 1 ) {
				if ( !eachBlock1_iterations[i1] ) {
					eachBlock1_iterations[i1] = renderEachBlock1$1( root, eachBlock1_value, eachBlock1_value[i1], i1, component );
					eachBlock1_iterations[i1].mount( eachBlock1_anchor.parentNode, eachBlock1_anchor );
				} else {
					eachBlock1_iterations[i1].update( changed, root, eachBlock1_value, eachBlock1_value[i1], i1 );
				}
			}
			
			teardownEach( eachBlock1_iterations, true, eachBlock1_value.length );
			
			eachBlock1_iterations.length = eachBlock1_value.length;
			
			setAttribute( path, 'd', root.areaPath );
		},
		
		teardown: function ( detach ) {
			teardownEach( eachBlock_iterations, false );
			
			teardownEach( eachBlock1_iterations, false );
			
			if ( detach ) {
				detachNode( g );
				detachNode( path );
			}
		}
	};
}

function renderEachBlock1$1 ( root, eachBlock1_value, tick, tick__index, component ) {
	var g = createSvgElement( 'g' );
	setAttribute( g, 'svelte-2649709840', '' );
	setAttribute( g, 'class', "tick tick-" + ( tick ) );
	setAttribute( g, 'transform', "translate( " + ( root.xScale(tick) ) + ", " + ( root.height ) + " )" );
	
	var ifBlock1_anchor = createComment();
	appendNode( ifBlock1_anchor, g );
	
	function getBlock1 ( root, eachBlock1_value, tick, tick__index ) {
		if ( root.width > 380 ) return renderIfBlock1_0$1;
		return renderIfBlock1_1$1;
	}
	
	var currentBlock1 = getBlock1( root, eachBlock1_value, tick, tick__index );
	var ifBlock1 = currentBlock1 && currentBlock1( root, eachBlock1_value, tick, tick__index, component );
	
	if ( ifBlock1 ) ifBlock1.mount( ifBlock1_anchor.parentNode, ifBlock1_anchor );

	return {
		mount: function ( target, anchor ) {
			insertNode( g, target, anchor );
		},
		
		update: function ( changed, root, eachBlock1_value, tick, tick__index ) {
			setAttribute( g, 'class', "tick tick-" + ( tick ) );
			setAttribute( g, 'transform', "translate( " + ( root.xScale(tick) ) + ", " + ( root.height ) + " )" );
			
			var _currentBlock1 = currentBlock1;
			currentBlock1 = getBlock1( root, eachBlock1_value, tick, tick__index );
			if ( _currentBlock1 === currentBlock1 && ifBlock1) {
				ifBlock1.update( changed, root, eachBlock1_value, tick, tick__index );
			} else {
				if ( ifBlock1 ) ifBlock1.teardown( true );
				ifBlock1 = currentBlock1 && currentBlock1( root, eachBlock1_value, tick, tick__index, component );
				if ( ifBlock1 ) ifBlock1.mount( ifBlock1_anchor.parentNode, ifBlock1_anchor );
			}
		},
		
		teardown: function ( detach ) {
			if ( ifBlock1 ) ifBlock1.teardown( false );
			
			if ( detach ) {
				detachNode( g );
			}
		}
	};
}

function renderIfBlock1_1$1 ( root, eachBlock1_value, tick, tick__index, component ) {
	var text = createSvgElement( 'text' );
	setAttribute( text, 'svelte-2649709840', '' );
	setAttribute( text, 'fill', "#000" );
	setAttribute( text, 'x', "0" );
	setAttribute( text, 'y', "0" );
	setAttribute( text, 'dy', "-2" );
	
	var text1 = createText( root.formatMobile(tick) );
	appendNode( text1, text );

	return {
		mount: function ( target, anchor ) {
			insertNode( text, target, anchor );
		},
		
		update: function ( changed, root, eachBlock1_value, tick, tick__index ) {
			text1.data = root.formatMobile(tick);
		},
		
		teardown: function ( detach ) {
			if ( detach ) {
				detachNode( text );
			}
		}
	};
}

function renderIfBlock1_0$1 ( root, eachBlock1_value, tick, tick__index, component ) {
	var text = createSvgElement( 'text' );
	setAttribute( text, 'svelte-2649709840', '' );
	setAttribute( text, 'fill', "#000" );
	setAttribute( text, 'x', "0" );
	setAttribute( text, 'y', "0" );
	setAttribute( text, 'dy', "-2" );
	
	var text1 = createText( tick );
	appendNode( text1, text );

	return {
		mount: function ( target, anchor ) {
			insertNode( text, target, anchor );
		},
		
		update: function ( changed, root, eachBlock1_value, tick, tick__index ) {
			text1.data = tick;
		},
		
		teardown: function ( detach ) {
			if ( detach ) {
				detachNode( text );
			}
		}
	};
}

function renderEachBlock$1 ( root, eachBlock_value, tick, tick__index, component ) {
	var g = createSvgElement( 'g' );
	setAttribute( g, 'svelte-2649709840', '' );
	setAttribute( g, 'class', "tick tick-" + ( tick ) );
	setAttribute( g, 'transform', "translate( 0, " + ( root.yScale(tick) - root.padding.bottom ) + " )" );
	
	var line = createSvgElement( 'line' );
	setAttribute( line, 'svelte-2649709840', '' );
	setAttribute( line, 'stroke', "#000" );
	setAttribute( line, 'x2', "100%" );
	setAttribute( line, 'y1', "0" );
	setAttribute( line, 'y2', "0" );
	
	appendNode( line, g );
	
	var text = createSvgElement( 'text' );
	setAttribute( text, 'svelte-2649709840', '' );
	setAttribute( text, 'fill', "#000" );
	setAttribute( text, 'x', "0" );
	setAttribute( text, 'y', "0" );
	setAttribute( text, 'dy', "-2" );
	
	appendNode( text, g );
	var text1 = createText( tick !== 0 ? tick : '' );
	appendNode( text1, text );
	var text2 = createText( tick === 20 ? ' per 1,000 population' : '' );
	appendNode( text2, text );

	return {
		mount: function ( target, anchor ) {
			insertNode( g, target, anchor );
		},
		
		update: function ( changed, root, eachBlock_value, tick, tick__index ) {
			setAttribute( g, 'class', "tick tick-" + ( tick ) );
			setAttribute( g, 'transform', "translate( 0, " + ( root.yScale(tick) - root.padding.bottom ) + " )" );
			
			text1.data = tick !== 0 ? tick : '';
			
			text2.data = tick === 20 ? ' per 1,000 population' : '';
		},
		
		teardown: function ( detach ) {
			if ( detach ) {
				detachNode( g );
			}
		}
	};
}

function Area ( options ) {
	options = options || {};
	
	this.refs = {};
	this._state = Object.assign( template$2.data(), options.data );
applyComputations$1( this._state, this._state, {}, true );

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root;
	this._yield = options._yield;

	if ( !addedCss$2 ) addCss$2();
	
	this._fragment = renderMainFragment$2( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );
	
	if ( options._root ) {
		options._root._renderHooks.push({ fn: template$2.onrender, context: this });
	} else {
		template$2.onrender.call( this );
	}
}

Area.prototype = template$2.methods;

Area.prototype.get = get;
Area.prototype.fire = fire;
Area.prototype.observe = observe;
Area.prototype.on = on;
Area.prototype.set = set$2;
Area.prototype._flush = _flush;

Area.prototype._set = function _set ( newState ) {
	var oldState = this._state;
	this._state = Object.assign( {}, oldState, newState );
	applyComputations$1( this._state, newState, oldState, false );
	
	dispatchObservers( this, this._observers.pre, newState, oldState );
	if ( this._fragment ) this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

Area.prototype.teardown = function teardown ( detach ) {
	this.fire( 'teardown' );

	this._fragment.teardown( detach !== false );
	this._fragment = null;

	this._state = {};
};

function applyComputations$2 ( state, newState, oldState, isInitial ) {
	if ( isInitial || ( 'padding' in newState && typeof state.padding === 'object' || state.padding !== oldState.padding ) || ( 'width' in newState && typeof state.width === 'object' || state.width !== oldState.width ) || ( 'xTicks' in newState && typeof state.xTicks === 'object' || state.xTicks !== oldState.xTicks ) ) {
		state.xScale = newState.xScale = template$3.computed.xScale( state.padding, state.width, state.xTicks );
	}
	
	if ( isInitial || ( 'xScale' in newState && typeof state.xScale === 'object' || state.xScale !== oldState.xScale ) || ( 'projects' in newState && typeof state.projects === 'object' || state.projects !== oldState.projects ) || ( 'width' in newState && typeof state.width === 'object' || state.width !== oldState.width ) || ( 'padding' in newState && typeof state.padding === 'object' || state.padding !== oldState.padding ) ) {
		state.barWidth = newState.barWidth = template$3.computed.barWidth( state.xScale, state.projects, state.width, state.padding );
	}
	
	if ( isInitial || ( 'padding' in newState && typeof state.padding === 'object' || state.padding !== oldState.padding ) || ( 'height' in newState && typeof state.height === 'object' || state.height !== oldState.height ) || ( 'yTicks' in newState && typeof state.yTicks === 'object' || state.yTicks !== oldState.yTicks ) ) {
		state.yScale = newState.yScale = template$3.computed.yScale( state.padding, state.height, state.yTicks );
	}
}

var template$3 = (function () {
	return {
		data () {
			return {
				padding: {
					top: 20,
					right: 15,
					bottom: 20,
					left: 25
				},
				height: 200,
				width: 300,
				foo: 'bar',
				yTicks:  [0, 5, 10, 15, 20 ],
				xTicks: [1990, 1995, 2000, 2005, 2010, 2015],
				formatMobile ( tick ) {
					return '\'' + tick.toString().slice(-2);
				}
			};
		},
		computed: {
			barWidth: function (xScale, projects, width, padding) {
				console.log(width, projects.length, padding.left, padding.right);
				var baseBarWidth = (xScale(projects[1].year) - xScale(projects[0].year));
				//return (width - padding.left - padding.right)/projects.length
				return baseBarWidth - (baseBarWidth/projects.length);
			},
			yScale: function ( padding, height, yTicks ) {
				return linear()
					.domain([Math.min.apply(null, yTicks), Math.max.apply(null, yTicks)])
   					.range([height - padding.bottom, padding.top]);
			},
			xScale: function ( padding, width, xTicks ) {
				return linear()
					.domain([Math.min.apply(null, xTicks), Math.max.apply(null, xTicks)])
   					.range([padding.left, width - padding.right]);
			}
		},
		onrender () {

			this.container = this.refs.svg;
		
			var self = this;

			window.addEventListener( 'resize', function () {
				self.resize();
			});

			this.resize();			
		},
		methods: {
			resize () {
				this.set({
					width: this.container.getBoundingClientRect().width,
					height: this.container.getBoundingClientRect().height
				});
			}
		}
	};
}());

let addedCss$3 = false;
function addCss$3 () {
	var style = createElement( 'style' );
	style.textContent = "\n\n\t.bars  rect[svelte-2982480005], .bars  [svelte-2982480005] rect, .bars[svelte-2982480005]  rect, [svelte-2982480005] .bars  rect {\n\t\tfill: #fb0;\n\t\tstroke: white;\n\t\tstroke-width: 2;\n\t\topacity: 0.5; \n\t}\n";
	appendNode( style, document.head );

	addedCss$3 = true;
}

function renderMainFragment$4 ( root, component ) {
	var h2 = createElement( 'h2' );
	setAttribute( h2, 'svelte-2982480005', '' );
	
	appendNode( createText( "Bar" ), h2 );
	var text1 = createText( "\n\n" );
	
	var svg = createSvgElement( 'svg' );
	setAttribute( svg, 'svelte-2982480005', '' );
	component.refs.svg = svg;
	
	var g = createSvgElement( 'g' );
	setAttribute( g, 'svelte-2982480005', '' );
	setAttribute( g, 'class', "bar" );
	
	appendNode( g, svg );
	var ifBlock_anchor = createComment();
	appendNode( ifBlock_anchor, g );
	
	function getBlock ( root ) {
		if ( root.ready ) return renderIfBlock_0$3;
		return null;
	}
	
	var currentBlock = getBlock( root );
	var ifBlock = currentBlock && currentBlock( root, component );
	
	if ( ifBlock ) ifBlock.mount( ifBlock_anchor.parentNode, ifBlock_anchor );

	return {
		mount: function ( target, anchor ) {
			insertNode( h2, target, anchor );
			insertNode( text1, target, anchor );
			insertNode( svg, target, anchor );
		},
		
		update: function ( changed, root ) {
			var _currentBlock = currentBlock;
			currentBlock = getBlock( root );
			if ( _currentBlock === currentBlock && ifBlock) {
				ifBlock.update( changed, root );
			} else {
				if ( ifBlock ) ifBlock.teardown( true );
				ifBlock = currentBlock && currentBlock( root, component );
				if ( ifBlock ) ifBlock.mount( ifBlock_anchor.parentNode, ifBlock_anchor );
			}
		},
		
		teardown: function ( detach ) {
			if ( component.refs.svg === svg ) component.refs.svg = null;
			if ( ifBlock ) ifBlock.teardown( false );
			
			if ( detach ) {
				detachNode( h2 );
				detachNode( text1 );
				detachNode( svg );
			}
		}
	};
}

function renderIfBlock_0$3 ( root, component ) {
	var g = createSvgElement( 'g' );
	setAttribute( g, 'svelte-2982480005', '' );
	setAttribute( g, 'transform', "translate(0,0)" );
	
	var g1 = createSvgElement( 'g' );
	setAttribute( g1, 'svelte-2982480005', '' );
	setAttribute( g1, 'class', "axes" );
	
	appendNode( g1, g );
	
	var g2 = createSvgElement( 'g' );
	setAttribute( g2, 'svelte-2982480005', '' );
	setAttribute( g2, 'class', "axis y-axis" );
	setAttribute( g2, 'transform', "translate(0, " + ( root.padding.top ) + " )" );
	
	appendNode( g2, g1 );
	var eachBlock_anchor = createComment();
	appendNode( eachBlock_anchor, g2 );
	var eachBlock_value = root.yTicks;
	var eachBlock_iterations = [];
	
	for ( var i1 = 0; i1 < eachBlock_value.length; i1 += 1 ) {
		eachBlock_iterations[i1] = renderEachBlock$2( root, eachBlock_value, eachBlock_value[i1], i1, component );
		eachBlock_iterations[i1].mount( eachBlock_anchor.parentNode, eachBlock_anchor );
	}
	
	var g3 = createSvgElement( 'g' );
	setAttribute( g3, 'svelte-2982480005', '' );
	setAttribute( g3, 'class', "axis x-axis" );
	
	appendNode( g3, g1 );
	var eachBlock1_anchor = createComment();
	appendNode( eachBlock1_anchor, g3 );
	var eachBlock1_value = root.projects;
	var eachBlock1_iterations = [];
	
	for ( var i2 = 0; i2 < eachBlock1_value.length; i2 += 1 ) {
		eachBlock1_iterations[i2] = renderEachBlock1$2( root, eachBlock1_value, eachBlock1_value[i2], i2, component );
		eachBlock1_iterations[i2].mount( eachBlock1_anchor.parentNode, eachBlock1_anchor );
	}
	
	var g4 = createSvgElement( 'g' );
	setAttribute( g4, 'svelte-2982480005', '' );
	setAttribute( g4, 'class', "bars" );
	
	var eachBlock2_anchor = createComment();
	appendNode( eachBlock2_anchor, g4 );
	var eachBlock2_value = root.projects;
	var eachBlock2_iterations = [];
	
	for ( var i3 = 0; i3 < eachBlock2_value.length; i3 += 1 ) {
		eachBlock2_iterations[i3] = renderEachBlock2( root, eachBlock2_value, eachBlock2_value[i3], i3, component );
		eachBlock2_iterations[i3].mount( eachBlock2_anchor.parentNode, eachBlock2_anchor );
	}

	return {
		mount: function ( target, anchor ) {
			insertNode( g, target, anchor );
			insertNode( g4, target, anchor );
		},
		
		update: function ( changed, root ) {
			setAttribute( g2, 'transform', "translate(0, " + ( root.padding.top ) + " )" );
			
			var eachBlock_value = root.yTicks;
			
			for ( var i1 = 0; i1 < eachBlock_value.length; i1 += 1 ) {
				if ( !eachBlock_iterations[i1] ) {
					eachBlock_iterations[i1] = renderEachBlock$2( root, eachBlock_value, eachBlock_value[i1], i1, component );
					eachBlock_iterations[i1].mount( eachBlock_anchor.parentNode, eachBlock_anchor );
				} else {
					eachBlock_iterations[i1].update( changed, root, eachBlock_value, eachBlock_value[i1], i1 );
				}
			}
			
			teardownEach( eachBlock_iterations, true, eachBlock_value.length );
			
			eachBlock_iterations.length = eachBlock_value.length;
			
			var eachBlock1_value = root.projects;
			
			for ( var i2 = 0; i2 < eachBlock1_value.length; i2 += 1 ) {
				if ( !eachBlock1_iterations[i2] ) {
					eachBlock1_iterations[i2] = renderEachBlock1$2( root, eachBlock1_value, eachBlock1_value[i2], i2, component );
					eachBlock1_iterations[i2].mount( eachBlock1_anchor.parentNode, eachBlock1_anchor );
				} else {
					eachBlock1_iterations[i2].update( changed, root, eachBlock1_value, eachBlock1_value[i2], i2 );
				}
			}
			
			teardownEach( eachBlock1_iterations, true, eachBlock1_value.length );
			
			eachBlock1_iterations.length = eachBlock1_value.length;
			
			var eachBlock2_value = root.projects;
			
			for ( var i3 = 0; i3 < eachBlock2_value.length; i3 += 1 ) {
				if ( !eachBlock2_iterations[i3] ) {
					eachBlock2_iterations[i3] = renderEachBlock2( root, eachBlock2_value, eachBlock2_value[i3], i3, component );
					eachBlock2_iterations[i3].mount( eachBlock2_anchor.parentNode, eachBlock2_anchor );
				} else {
					eachBlock2_iterations[i3].update( changed, root, eachBlock2_value, eachBlock2_value[i3], i3 );
				}
			}
			
			teardownEach( eachBlock2_iterations, true, eachBlock2_value.length );
			
			eachBlock2_iterations.length = eachBlock2_value.length;
		},
		
		teardown: function ( detach ) {
			teardownEach( eachBlock_iterations, false );
			
			teardownEach( eachBlock1_iterations, false );
			
			teardownEach( eachBlock2_iterations, false );
			
			if ( detach ) {
				detachNode( g );
				detachNode( g4 );
			}
		}
	};
}

function renderEachBlock2 ( root, eachBlock2_value, project, i, component ) {
	var rect = createSvgElement( 'rect' );
	setAttribute( rect, 'svelte-2982480005', '' );
	setAttribute( rect, 'x', (i * root.barWidth) + root.padding.left );
	setAttribute( rect, 'y', root.yScale(project.birthrate_all) );
	setAttribute( rect, 'width', root.barWidth );
	setAttribute( rect, 'height', root.height - root.padding.bottom - root.yScale(project.birthrate_all) );

	return {
		mount: function ( target, anchor ) {
			insertNode( rect, target, anchor );
		},
		
		update: function ( changed, root, eachBlock2_value, project, i ) {
			setAttribute( rect, 'x', (i * root.barWidth) + root.padding.left );
			setAttribute( rect, 'y', root.yScale(project.birthrate_all) );
			setAttribute( rect, 'width', root.barWidth );
			setAttribute( rect, 'height', root.height - root.padding.bottom - root.yScale(project.birthrate_all) );
		},
		
		teardown: function ( detach ) {
			if ( detach ) {
				detachNode( rect );
			}
		}
	};
}

function renderEachBlock1$2 ( root, eachBlock1_value, project, t, component ) {
	var g = createSvgElement( 'g' );
	setAttribute( g, 'svelte-2982480005', '' );
	setAttribute( g, 'class', "tick tick-" + ( root.tick ) );
	setAttribute( g, 'transform', "translate( " + ( (t * root.barWidth) + root.padding.left + root.barWidth/2 ) + ", " + ( root.height ) + " )" );
	
	var ifBlock1_anchor = createComment();
	appendNode( ifBlock1_anchor, g );
	
	function getBlock1 ( root, eachBlock1_value, project, t ) {
		if ( root.width > 380 ) return renderIfBlock1_0$2;
		return renderIfBlock1_1$2;
	}
	
	var currentBlock1 = getBlock1( root, eachBlock1_value, project, t );
	var ifBlock1 = currentBlock1 && currentBlock1( root, eachBlock1_value, project, t, component );
	
	if ( ifBlock1 ) ifBlock1.mount( ifBlock1_anchor.parentNode, ifBlock1_anchor );

	return {
		mount: function ( target, anchor ) {
			insertNode( g, target, anchor );
		},
		
		update: function ( changed, root, eachBlock1_value, project, t ) {
			setAttribute( g, 'class', "tick tick-" + ( root.tick ) );
			setAttribute( g, 'transform', "translate( " + ( (t * root.barWidth) + root.padding.left + root.barWidth/2 ) + ", " + ( root.height ) + " )" );
			
			var _currentBlock1 = currentBlock1;
			currentBlock1 = getBlock1( root, eachBlock1_value, project, t );
			if ( _currentBlock1 === currentBlock1 && ifBlock1) {
				ifBlock1.update( changed, root, eachBlock1_value, project, t );
			} else {
				if ( ifBlock1 ) ifBlock1.teardown( true );
				ifBlock1 = currentBlock1 && currentBlock1( root, eachBlock1_value, project, t, component );
				if ( ifBlock1 ) ifBlock1.mount( ifBlock1_anchor.parentNode, ifBlock1_anchor );
			}
		},
		
		teardown: function ( detach ) {
			if ( ifBlock1 ) ifBlock1.teardown( false );
			
			if ( detach ) {
				detachNode( g );
			}
		}
	};
}

function renderIfBlock1_1$2 ( root, eachBlock1_value, project, t, component ) {
	var text = createSvgElement( 'text' );
	setAttribute( text, 'svelte-2982480005', '' );
	setAttribute( text, 'fill', "#000" );
	setAttribute( text, 'x', "0" );
	setAttribute( text, 'y', "0" );
	setAttribute( text, 'dy', "-2" );
	
	var text1 = createText( root.formatMobile(project.year) );
	appendNode( text1, text );

	return {
		mount: function ( target, anchor ) {
			insertNode( text, target, anchor );
		},
		
		update: function ( changed, root, eachBlock1_value, project, t ) {
			text1.data = root.formatMobile(project.year);
		},
		
		teardown: function ( detach ) {
			if ( detach ) {
				detachNode( text );
			}
		}
	};
}

function renderIfBlock1_0$2 ( root, eachBlock1_value, project, t, component ) {
	var text = createSvgElement( 'text' );
	setAttribute( text, 'svelte-2982480005', '' );
	setAttribute( text, 'fill', "#000" );
	setAttribute( text, 'x', "0" );
	setAttribute( text, 'y', "0" );
	setAttribute( text, 'dy', "-2" );
	
	var text1 = createText( project.year );
	appendNode( text1, text );

	return {
		mount: function ( target, anchor ) {
			insertNode( text, target, anchor );
		},
		
		update: function ( changed, root, eachBlock1_value, project, t ) {
			text1.data = project.year;
		},
		
		teardown: function ( detach ) {
			if ( detach ) {
				detachNode( text );
			}
		}
	};
}

function renderEachBlock$2 ( root, eachBlock_value, tick, tick__index, component ) {
	var g = createSvgElement( 'g' );
	setAttribute( g, 'svelte-2982480005', '' );
	setAttribute( g, 'class', "tick tick-" + ( tick ) );
	setAttribute( g, 'transform', "translate( 0, " + ( root.yScale(tick) - root.padding.bottom ) + " )" );
	
	var line = createSvgElement( 'line' );
	setAttribute( line, 'svelte-2982480005', '' );
	setAttribute( line, 'stroke', "#000" );
	setAttribute( line, 'x2', "100%" );
	setAttribute( line, 'y1', "0" );
	setAttribute( line, 'y2', "0" );
	
	appendNode( line, g );
	
	var text = createSvgElement( 'text' );
	setAttribute( text, 'svelte-2982480005', '' );
	setAttribute( text, 'fill', "#000" );
	setAttribute( text, 'x', "0" );
	setAttribute( text, 'y', "0" );
	setAttribute( text, 'dy', "-2" );
	
	appendNode( text, g );
	var text1 = createText( tick !== 0 ? tick : '' );
	appendNode( text1, text );
	var text2 = createText( tick === 20 ? ' per 1,000 population' : '' );
	appendNode( text2, text );

	return {
		mount: function ( target, anchor ) {
			insertNode( g, target, anchor );
		},
		
		update: function ( changed, root, eachBlock_value, tick, tick__index ) {
			setAttribute( g, 'class', "tick tick-" + ( tick ) );
			setAttribute( g, 'transform', "translate( 0, " + ( root.yScale(tick) - root.padding.bottom ) + " )" );
			
			text1.data = tick !== 0 ? tick : '';
			
			text2.data = tick === 20 ? ' per 1,000 population' : '';
		},
		
		teardown: function ( detach ) {
			if ( detach ) {
				detachNode( g );
			}
		}
	};
}

function Bar ( options ) {
	options = options || {};
	
	this.refs = {};
	this._state = Object.assign( template$3.data(), options.data );
applyComputations$2( this._state, this._state, {}, true );

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root;
	this._yield = options._yield;

	if ( !addedCss$3 ) addCss$3();
	
	this._fragment = renderMainFragment$4( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );
	
	if ( options._root ) {
		options._root._renderHooks.push({ fn: template$3.onrender, context: this });
	} else {
		template$3.onrender.call( this );
	}
}

Bar.prototype = template$3.methods;

Bar.prototype.get = get;
Bar.prototype.fire = fire;
Bar.prototype.observe = observe;
Bar.prototype.on = on;
Bar.prototype.set = set$2;
Bar.prototype._flush = _flush;

Bar.prototype._set = function _set ( newState ) {
	var oldState = this._state;
	this._state = Object.assign( {}, oldState, newState );
	applyComputations$2( this._state, newState, oldState, false );
	
	dispatchObservers( this, this._observers.pre, newState, oldState );
	if ( this._fragment ) this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

Bar.prototype.teardown = function teardown ( detach ) {
	this.fire( 'teardown' );

	this._fragment.teardown( detach !== false );
	this._fragment = null;

	this._state = {};
};

var template = (function () {
	
	var template = {
		data () {
			return {
				projects: [],
				ready: false
			};
		},
		components: {
			Line,
			Area,
			Bar
		},
		onrender () {
			console.log('rendered');
		}

	};

	(function () {
		  var xhttp = new XMLHttpRequest();
		  xhttp.onreadystatechange = function() {
		    if (this.readyState == 4 && this.status == 200) {
		    	console.log(this, 'this');
		    	var projects = JSON.parse(this.responseText);
		    	projects.sort(function ( a, b ) {
		    		return a.year - b.year;
		    	});
		    	console.log(projects, 'proj');

		    	//pass data to Svelte app
		    	app.set({ projects, ready: true });
		    }
		  };
		  xhttp.open("GET", './data/births_by_race.json', true);
		  xhttp.send();
	})();


	
	return template;
}());

let addedCss = false;
function addCss () {
	var style = createElement( 'style' );
	style.textContent = "\n\t.charts[svelte-3406972158], [svelte-3406972158] .charts {\n\t\tmax-width: 480px;\n\t\twidth: 100%;\n\t\tmargin: 0 auto;\n\t}\n\n\t.charts  h1[svelte-3406972158], .charts  [svelte-3406972158] h1, .charts[svelte-3406972158]  h1, [svelte-3406972158] .charts  h1 {\n\t\tfont-family: Georgia, serif;\n\t}\n\t.charts  h2[svelte-3406972158], .charts  [svelte-3406972158] h2, .charts[svelte-3406972158]  h2, [svelte-3406972158] .charts  h2, .charts  p[svelte-3406972158], .charts  [svelte-3406972158] p, .charts[svelte-3406972158]  p, [svelte-3406972158] .charts  p {\n\t\tfont-family: Helvetica, sans-serif;\n\t}\n\t.charts  h1[svelte-3406972158], .charts  [svelte-3406972158] h1, .charts[svelte-3406972158]  h1, [svelte-3406972158] .charts  h1 {\n\t\tfont-size: 1.825em;\n\t}\n\t.charts  h2[svelte-3406972158], .charts  [svelte-3406972158] h2, .charts[svelte-3406972158]  h2, [svelte-3406972158] .charts  h2 {\n\t\tfont-size: 1em;\n\t}\t\n\t.charts  p[svelte-3406972158], .charts  [svelte-3406972158] p, .charts[svelte-3406972158]  p, [svelte-3406972158] .charts  p {\n\t\tfont-size: .825em; \n\t\tcolor: #ccc;\n\t}\n\t.charts  svg[svelte-3406972158], .charts  [svelte-3406972158] svg, .charts[svelte-3406972158]  svg, [svelte-3406972158] .charts  svg {\n\t\tposition: relative;\n\t\twidth: 100%;\n\t\theight: 100%;\n\t}\n\t.charts  .tick[svelte-3406972158], .charts  [svelte-3406972158] .tick, .charts[svelte-3406972158]  .tick, [svelte-3406972158] .charts  .tick, p.source[svelte-3406972158], [svelte-3406972158] p.source {\n\t\tfont-family: Helvetica, Arial;\n\t\tfont-size: .725em;\n\t\tfont-weight: 200;\n\t}\n\t.charts  .tick  line[svelte-3406972158], .charts  .tick  [svelte-3406972158] line, .charts  .tick[svelte-3406972158]  line, .charts  [svelte-3406972158] .tick  line, .charts[svelte-3406972158]  .tick  line, [svelte-3406972158] .charts  .tick  line {\n\t\tstroke: #e2e2e2;\n\t\tstroke-dasharray: 2;\n\t}\n\t.charts  .tick  text[svelte-3406972158], .charts  .tick  [svelte-3406972158] text, .charts  .tick[svelte-3406972158]  text, .charts  [svelte-3406972158] .tick  text, .charts[svelte-3406972158]  .tick  text, [svelte-3406972158] .charts  .tick  text {\n\t\tfill: #ccc;\n\t\ttext-anchor: start;\n\t}\n\t.charts  .tick.tick-0  line[svelte-3406972158], .charts  .tick.tick-0  [svelte-3406972158] line, .charts  .tick.tick-0[svelte-3406972158]  line, .charts  [svelte-3406972158] .tick.tick-0  line, .charts[svelte-3406972158]  .tick.tick-0  line, [svelte-3406972158] .charts  .tick.tick-0  line {\n\t\tstroke-dasharray: 0;\n\t}\n\t.charts  .x-axis  .tick  text[svelte-3406972158], .charts  .x-axis  .tick  [svelte-3406972158] text, .charts  .x-axis  .tick[svelte-3406972158]  text, .charts  .x-axis  [svelte-3406972158] .tick  text, .charts  .x-axis[svelte-3406972158]  .tick  text, .charts  [svelte-3406972158] .x-axis  .tick  text, .charts[svelte-3406972158]  .x-axis  .tick  text, [svelte-3406972158] .charts  .x-axis  .tick  text {\n\t\ttext-anchor: middle;\n\t}\n";
	appendNode( style, document.head );

	addedCss = true;
}

function renderMainFragment ( root, component ) {
	var div = createElement( 'div' );
	setAttribute( div, 'svelte-3406972158', '' );
	div.className = "charts";
	
	var h1 = createElement( 'h1' );
	setAttribute( h1, 'svelte-3406972158', '' );
	
	appendNode( h1, div );
	appendNode( createText( "US birthrate by year, 1990-2015" ), h1 );
	appendNode( createText( "\n\t\n\t" ), div );
	var ifBlock_anchor = createComment();
	appendNode( ifBlock_anchor, div );
	
	function getBlock ( root ) {
		if ( root.ready ) return renderIfBlock_0;
		return null;
	}
	
	var currentBlock = getBlock( root );
	var ifBlock = currentBlock && currentBlock( root, component );
	
	if ( ifBlock ) ifBlock.mount( ifBlock_anchor.parentNode, ifBlock_anchor );
	appendNode( createText( "\n\n\t" ), div );
	
	var p = createElement( 'p' );
	setAttribute( p, 'svelte-3406972158', '' );
	p.className = "source";
	
	appendNode( p, div );
	appendNode( createText( "Source: " ), p );
	
	var a = createElement( 'a' );
	setAttribute( a, 'svelte-3406972158', '' );
	a.href = "https://www.cdc.gov/nchs/data/nvsr/nvsr66/nvsr66_01.pdf";
	a.target = "_blank";
	
	appendNode( a, p );
	appendNode( createText( "CDC" ), a );

	return {
		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
		},
		
		update: function ( changed, root ) {
			var _currentBlock = currentBlock;
			currentBlock = getBlock( root );
			if ( _currentBlock === currentBlock && ifBlock) {
				ifBlock.update( changed, root );
			} else {
				if ( ifBlock ) ifBlock.teardown( true );
				ifBlock = currentBlock && currentBlock( root, component );
				if ( ifBlock ) ifBlock.mount( ifBlock_anchor.parentNode, ifBlock_anchor );
			}
		},
		
		teardown: function ( detach ) {
			if ( ifBlock ) ifBlock.teardown( false );
			
			if ( detach ) {
				detachNode( div );
			}
		}
	};
}

function renderIfBlock_0 ( root, component ) {
	var line_initialData = {
		projects: root.projects,
		ready: root.ready
	};
	var line = new template.components.Line({
		target: null,
		_root: component._root || component,
		data: line_initialData
	});
	
	var text = createText( "\n\t\t" );
	
	var area_initialData = {
		projects: root.projects,
		ready: root.ready
	};
	var area = new template.components.Area({
		target: null,
		_root: component._root || component,
		data: area_initialData
	});
	
	var text1 = createText( "\n\t\t" );
	
	var bar_initialData = {
		projects: root.projects,
		ready: root.ready
	};
	var bar = new template.components.Bar({
		target: null,
		_root: component._root || component,
		data: bar_initialData
	});

	return {
		mount: function ( target, anchor ) {
			line._fragment.mount( target, anchor );
			insertNode( text, target, anchor );
			area._fragment.mount( target, anchor );
			insertNode( text1, target, anchor );
			bar._fragment.mount( target, anchor );
		},
		
		update: function ( changed, root ) {
			var line_changes = {};
			
			if ( 'projects' in changed ) line_changes.projects = root.projects;
			if ( 'ready' in changed ) line_changes.ready = root.ready;
			
			if ( Object.keys( line_changes ).length ) line.set( line_changes );
			
			var area_changes = {};
			
			if ( 'projects' in changed ) area_changes.projects = root.projects;
			if ( 'ready' in changed ) area_changes.ready = root.ready;
			
			if ( Object.keys( area_changes ).length ) area.set( area_changes );
			
			var bar_changes = {};
			
			if ( 'projects' in changed ) bar_changes.projects = root.projects;
			if ( 'ready' in changed ) bar_changes.ready = root.ready;
			
			if ( Object.keys( bar_changes ).length ) bar.set( bar_changes );
		},
		
		teardown: function ( detach ) {
			line.teardown( detach );
			area.teardown( detach );
			bar.teardown( detach );
			
			if ( detach ) {
				detachNode( text );
				detachNode( text1 );
			}
		}
	};
}

function App ( options ) {
	options = options || {};
	
	this._state = Object.assign( template.data(), options.data );

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root;
	this._yield = options._yield;

	if ( !addedCss ) addCss();
	this._renderHooks = [];
	
	this._fragment = renderMainFragment( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );
	
	this._flush();
	
	if ( options._root ) {
		options._root._renderHooks.push({ fn: template.onrender, context: this });
	} else {
		template.onrender.call( this );
	}
}

App.prototype.get = get;
App.prototype.fire = fire;
App.prototype.observe = observe;
App.prototype.on = on;
App.prototype.set = set$2;
App.prototype._flush = _flush;

App.prototype._set = function _set ( newState ) {
	var oldState = this._state;
	this._state = Object.assign( {}, oldState, newState );
	
	dispatchObservers( this, this._observers.pre, newState, oldState );
	if ( this._fragment ) this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
	
	this._flush();
};

App.prototype.teardown = function teardown ( detach ) {
	this.fire( 'teardown' );

	this._fragment.teardown( detach !== false );
	this._fragment = null;

	this._state = {};
};

window.app = new App({
	target: document.querySelector( 'main' ),
	data: {
		answer: 50
	}
});

}());
