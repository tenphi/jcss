/*
 JCSS by Andrey Yamanov <tenphi@gmail.com>

 Licensed under MIT
 */

(function(jcss, undefined) {

  /* decorators */

  var charOpen = '{', charClose = '}', charColon = ':', charNl = '\n', charNl2 = '\n\n', charDel = ';', charSpace = ' ', charTab = '  ';

  /* utils */

  var utils = jcss.utils = {};

  var type = utils.type = (function() {
    var classToType, name, i, len, ref;
    classToType = {};
    ref = 'Boolean Number String Function Array Date Regexp Undefined Null'.split(' ');
    for (i = 0, len = ref.length; i < len; i++) {
      name = ref[i];
      classToType['[object ' + name + ']'] = name.toLowerCase();
    }
    return function type (obj) {
      return classToType[Object.prototype.toString.call(obj)] || 'object';
    };
  })();

  var isArray = utils.isArray = function isArray (arr) {
    return type(arr) === 'array';
  };

  var isObject = utils.isObject = function isObject (obj) {
    return type(obj) === 'object';
  };

  var isFunction = utils.isFunction = function isFunction (func) {
    return type(func) === 'function';
  };

  var isString = utils.isString = function isString (str) {
    return type(str) === 'string';
  };

  var isBoolean = utils.isBoolean = function isBoolean (bool) {
    return type(bool) === 'boolean';
  };

  var isNumber = utils.isNumber = function isNumber (bool) {
    return type(bool) === 'number';
  };

  var isNaN = utils.isNaN = function isNaN (num) {
    return num !== num;
  };

  var extend = utils.extend = function extend (obj, extObj) {
    if (arguments.length > 2) {
      for (var a = 1; a < arguments.length; a++) {
        extend(obj, arguments[a]);
      }
    } else {
      for (var i in extObj) {
        if (isPlainObject(extObj[i])) {
          obj[i] = extend({}, extObj[i]);
        } else {
          obj[i] = extObj[i];
        }
      }
    }
    return obj;
  };

  var isPlainObject = utils.isPlainObject = function isPlainObject (obj) {
    if (!obj || typeof(obj) !== "object" || obj.nodeType) {
      return false;
    }

    try {
      if (obj.constructor &&
        !Object.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
        return false;
      }
    } catch (e) {
      return false;
    }

    return true;
  };

  var toString = utils.toString = function toString (val) {
    return (isFunction(val.toString) && val.toString()) || Object.prototype.toString.call(val);
  };

  var cleanObject = utils.cleanObject = function cleanObject (obj) {
    var name, empty = true, check;
    for (name in obj) {
      if (!obj.hasOwnProperty(name)) {
        continue;
      }
      if (isPlainObject(obj[name])) {
        check = cleanObject(obj[name]);
        if (check) {
          delete obj[name];
        }
      } else if (obj[name] === undefined) {
        delete obj[name];
      }
      empty = false;
    }
    return empty;
  };

  /* render utils */

  var handleStyleName = function handleStyleName (name) {
    return name.replace(/[A-Z]/g, function(s) {
      return '-' + s.toLowerCase();
    });
  };
  var handleName = function handleName (name) {
    return name.replace(/\s+$/, '');
  };

  var containers = ['media', 'supports'];
  var multipliers = ['font-face', 'page'];
  var plains = ['import', 'charset'];

  var renderUtils = jcss.renderUtils = {
    handleStyleName: handleStyleName,
    handleName: handleName,
    containers: containers,
    multipliers: multipliers,
    plains: plains
  };

  var isInnerSelector = function isInnerSelector (sel) {
    sel = sel.trim();
    var len = sel.length;
    if (sel.charAt(0) === '&') {
      return 1;
    } else if (sel.charAt(len - 1) === '&') {
      return 2;
    } else {
      return 0;
    }
  };

  var isContainer = function isContainer (selector) {
    var i, len, name;
    for (i = 0, len = containers.length; i < len; i++) {
      name = '@' + containers[i];
      if (selector.slice(0, name.length) === name) {
        return true;
      }
    }
    return false;
  };

  var isMultiplier = function isMultiplier (selector) {
    var i, len, name;
    for (i = 0, len = multipliers.length; i < len; i++) {
      name = '@' + multipliers[i];
      if (selector.slice(0, name.length) === name) {
        return true;
      }
    }
    return false;
  };

  var isPlain = function isPlain (selector) {
    var i, len, name;
    for (i = 0, len = plains.length; i < len; i++) {
      name = '@' + plains[i];
      if (selector.slice(0, name.length) === name) {
        return true;
      }
    }
    return false;
  };

  var addNamespace = function addNamespace (ssel, namespace) {
    var pos = isInnerSelector(ssel);
    var fsel = ssel && ssel.replace('&', '');
    if (!namespace) {
      return fsel;
    }
    fsel = fsel.replace('&', '');
    switch(pos) {
      case 0:
        return namespace + ' ' + fsel.trim();
        break;
      case 1:
        return namespace + fsel;
        break;
      case 2:
        return fsel + namespace;
        break;
      default:
        throw new Error('jcss: wrong inner selector', ssel);
    }
  };

  /* mixins  */

  var mixins = jcss.mixins = {
    size: function size (val) {
      val = toString(val);
      val = val.split(/\s+/);
      if (!val.length) return undefined;
      return {
        width: val[0],
        height: val[1] === undefined ? val[0] : val[1]
      }
    }
  };

  var pxAdditionList = 'width height maxWidth maxHeight outlineWidth borderWidth borderTopWidth borderRightWidth borderBottomWidth borderLeftWidth margin padding marginTop marginRight marginBottom marginLeft paddingTop borderRadius borderRadiusTopLeft borderRadiusTopRight borderRadiusBottomRight borderRadiusBottomLeft lineHeight top right bottom left fontSize letterSpacing'.split(/ /g);
  for (var i = 0; i < pxAdditionList.length; i++) {
    var styleName = pxAdditionList[i];
    jcss.mixins[styleName] = pxAdd;
  }

  function pxAdd (v) {
    return v && typeof(v) === 'number' ? v + 'px' : v.toString();
  }

  var handleMixins = function handleMixins (styles, ignore) {
    var name, values, val, ret, out = {}, i, temp, mixins = jcss.mixins;
    for (name in styles) {
      if (!styles.hasOwnProperty(name)) {
        continue;
      }
      values = styles[name];
      if (!isArray(values)) {
        values = [values];
      }
      if (mixins[name] && name !== ignore) {
        for (i = 0; i < values.length; i++) {
          val = values[i];
          ret = mixins[name](val) || {};
          if (!isPlainObject(ret)) {
            temp = ret;
            ret = {};
            ret[name] = temp;
          }
          ret = handleMixins(ret || {}, name);
          cleanObject(ret);
          extend(out, ret);
        }
      } else {
        out[name] = values;
      }
    }
    return out;
  };

  /* normalize */

  var normalize = jcss.normalize = function normalize (css, namespace) {
    var newcss = {}, selector, styles, style, nsel, tmp, newstyles, val, i, selns, selns2;
    namespace = namespace || '';
    for (selector in css) {
      if (!css.hasOwnProperty(selector)) {
        continue;
      }
      styles = css[selector];
      selns = addNamespace(selector, namespace);
      if (isContainer(selector)) {
        if (!newcss[selector]) {
          newcss[selector] = {};
        }
        newstyles = {};
        newstyles[namespace] = styles;
        extend(newcss[selector], normalize(newstyles));
        continue;
      } else if (isMultiplier(selector) || isPlain(selector)) {
        selector = selector.trim();
        if (!newcss[selector]) {
          newcss[selector] = [];
        }
        if (!isArray(styles)) {
          styles = [styles];
        }
        newcss[selector] = newcss[selector].concat(styles);
        continue;
      }
      tmp = selector.replace(/\|/g, ',').split(',');
      if (tmp.length > 1) {
        for (i = 0; i < tmp.length; i++) {
          nsel = tmp[i];
          selns2 = addNamespace(nsel || selector, namespace);
          newstyles = {};
          newstyles[selns2.trim()] = extend({}, styles);
          extend(newcss, jcss.normalize(newstyles));
        }
        continue;
      } else if (!isPlainObject(newcss[selns])) {
        newcss[selns] = {};
      }
      for (style in styles) {
        if (!styles.hasOwnProperty(style)) {
          continue;
        }
        val = styles[style];
        if (isPlainObject(val)) {
          newstyles = {};
          newstyles[handleName(style)] = extend({}, val);
          extend(newcss, normalize(newstyles, selns));
        } else if (isString(val) || isNumber(val)) {
          styles[style] = [val];
        } else if (isObject(val) && isFunction(val.toString)) {
          styles[style] = [val.toString()];
        }
        if (!isArray(styles[style])) {
          continue;
        }
        newcss[selns][style] = styles[style];
      }
    }

    if (!namespace) {
      for (selector in newcss) {
        if (!newcss.hasOwnProperty(selector)) {
          continue;
        }
        styles = newcss[selector];
        nsel = handleName(selector);
        if (nsel === selector)
          continue;
        if (!newcss[nsel]) {
          newcss[nsel] = {};
        }
        extend(newcss[nsel], newcss[selector]);
        delete newcss[selector];
      }
    }

    return newcss;
  };

  /* render */

  var render = jcss.render = function render (css, min, tab) {
    var out = '', styles, sel, strTab, style, val, fstyle, values, i, tmp;

    if (!isPlainObject(css)) {
      throw 'jcss: wrong input data - ' + typeof(css);
    }

    tab = tab || 0;
    if (tab) {
      strTab = (new Array(tab+1)).join(charTab);
    } else {
      strTab = '';
    }

    css = normalize(css);

    cleanObject(css);

    for (sel in css) {
      if (!css.hasOwnProperty(sel)) {
        continue;
      }
      styles = css[sel];
      if (isPlain(sel)) {
        for (i = 0; i < styles.length; i++) {
          val = styles[i];
          if (min) {
            out += sel + charSpace + val + charDel;
          } else {
            out += sel + charSpace + val + charDel + charNl2;
          }
        }
      } else if (isContainer(sel)) {
        if (min) {
          out += strTab + sel + charOpen + render(styles, min, tab + 1) + charClose;
        } else {
          out += strTab + sel + charSpace + charOpen + charNl + charNl + render(styles, min, tab + 1) + strTab + charClose + charNl2;
        }
      } else if (isMultiplier(sel)) {
        for (i = 0; i < styles.length; i++) {
          tmp = {};
          tmp[''] = styles[i];
          out += sel + render(tmp, min);
        }
      }
    }
    for (sel in css) {
      styles = css[sel];
      if (isContainer(sel) || isMultiplier(sel) || isPlain(sel))
        continue;
      if (min) {
        out += sel + charOpen;
      } else {
        out += strTab + sel + charSpace + charOpen + charNl;
      }
      styles = handleMixins(styles);
      for (style in styles) {
        val = styles[style];
        fstyle = handleStyleName(style);
        values = Array.isArray(val) ? val : [val];
        if (!values.length)
          continue;
        for (i = 0; i < values.length; i++) {
          val = values[i];
          if (min) {
            out += fstyle + charColon + val + charDel;
          } else {
            out += strTab + charTab + fstyle + charColon + charSpace + val + charDel + charNl;
          }
        }
      }
      if (min) {
        out += charClose;
      } else {
        out += strTab + charClose + charNl2;
      }
    }

    return out;
  };

  /* Inject */

  if (typeof(window) !== 'undefined') {
    jcss.inject = function inject (name, css, min, tab) {
      if (!isString(name) || !(name = name.trim())) {
        throw new Error('jcss: wrong style name');
      }
      if (isPlainObject(css)) {
        css = render(css, min, tab);
      }
      if (!isString(css)) {
        throw new Error('jcss: wrong css data');
      }
      var head = document.getElementsByTagName('head')[0],
        style = document.createElement('style');

      css = "\r\n" + css;
      jcss.remove(name);
      style.type = 'text/css';
      style.setAttribute('data-jcss', name);
      if (style.styleSheet){
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      head.appendChild(style);
      return this;
    };
    jcss.remove = function remove (name) {
      if (!isString(name) || !(name = name.trim())) {
        throw new Error('jcss: wrong style name');
      }
      var head = document.getElementsByTagName('head')[0],
        currentStyle = document.querySelectorAll('style[data-jcss="' + name + '"]', head)[0];

      if (currentStyle) {
        head.removeChild(currentStyle);
      }
      return this;
    };
  }

  /* RequireJS Define */

  if (typeof(define) === "function") {
    define( "jcss", [], function () { return jcss; } );
  };

})(typeof(exports) === 'undefined' ? this.jcss = {} : exports, undefined);
