var exports = module.exports;
var fs = require('fs');

var handlers = {};

function isArray(val) {
    return val &&
        typeof val === 'object' &&
        typeof val.length === 'number' &&
        typeof val.splice === 'function' &&
        !(val.propertyIsEnumerable('length'));
}

function isPlainObject(obj) {
	if (!obj || typeof obj !== "object") {
		return false;
	}

	if (obj.constructor &&
            !Object.prototype.hasOwnProperty.call(obj, "constructor") &&
            !Object.prototype.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
		return false;
	}

	var key;
	for (key in obj) {}

	return key === undefined || Object.prototype.hasOwnProperty.call(obj, key);
}

exports.render = function (css, minified, namespace, offset) {
    var decoration = {
        min: {
            open: '{',
            nl: '',
            mid: ':',
            close: '}',
            tab: ''
        },
        full: {
            open: ' {',
            nl: "\r\n",
            mid: ': ',
            close: '}',
            tab: '  '
        }
    }, dec, sel, fsel, styles, style, value, values, fixedStyle, i, out = '';

	if (typeof css === 'string') {
		css = JSON.parse(fs.readFileSync(css));
	}
	if (!isPlainObject) {
        console.log('node-jss: wrong input data');
        return '';
    }
    if (!namespace) {
        namespace = '';
    }
    if (minified) {
        dec = decoration.min;
    } else {
        dec = decoration.full;
    }
    if (offset) {
        offset = dec.tab;
    } else {
        offset = '';
    }
    css = normalize(css);
    for (sel in css) {
        fsel = namespace + sel;
        styles = css[sel];
        if (!offset && !namespace && sel.substr(0, 6) === '@media') {
            out += sel + dec.open + dec.nl;
            out += this.render(css[sel], minified, '', true);
            out += dec.close + dec.nl;
            continue;
        }
        if (!isPlainObject(styles)) {
            continue;
        }
        out += offset + fsel + dec.open + dec.nl;
        for (style in styles) {
            fixedStyle = style.replace(/[A-Z]/g, fixName);
            values = styles[style];
            if (!isArray(values)) {
                values = [values];
            }
            values.forEach(handleStyle);
        }
        out += offset + dec.close + dec.nl;
    }
    function fixName(s) {
        return '-' + s.toLowerCase();
    }
    function handleStyle(value) {
        out += offset + dec.tab + style + dec.mid + value + ';' + dec.nl;
    }
    return out;
};

function normalize(styles) {
    var newstyles, selector, sel, options, style, name, i;
	for (selector in styles) {
        if (selector.substr(0, 6) == '@media') {
            styles[selector] = normalize(styles[selector]);
            continue;
        }
		if (!isPlainObject(styles[selector])) styles[selector] = {};
		for (style in styles[selector]) {
			if (handlers[style] instanceof Function) {
				options = styles[selector][style];
				delete styles[selector][style];
				if (!isArray(options)) {
                    options = [options];
                }
				for (i = 0; i < options.length; i++) {
					newstyles = handlers[style](options[i]);
					if (!isPlainObject(newstyles)) {
                        continue;
                    }
					for (name in newstyles) {
						if (styles[selector][name]) {
							if (isArray(styles[selector][name])) {
								styles[selector][name].push(newstyles[name]);
							} else {
								styles[selector][name] = [styles[selector][name], newstyles[name]];
							}
						} else {
							styles[selector][name] = newstyles[name];
						}
					}
				}
			} else if (isPlainObject(styles[selector][style])) {
				newstyles = {};
				newstyles[selector + style] = styles[selector][style];
				newstyles = normalize(newstyles);
				for (sel in newstyles) {
					if (!isPlainObject(styles[sel])) styles[sel] = {};
					styles[sel] = newstyles[sel];
				}
				delete styles[selector][style];
			} else if (typeof(styles[selector][style]) == 'object') {
				styles[selector][style] = '' + styles[selector][style];
			} else if (!isArray(styles[selector][style]) && typeof(styles[selector][style]) != 'string' 
                && typeof(styles[selector][style]) != 'number') {
				delete styles[selector][style];
			}
		};
	};
	return styles;
}

exports.handler = function (name, handler) {
	if (!handler) {
		return handlers[name];
	}
	if (!(handler instanceof Function)) {
        return null;
    }
	handlers[name] = handler;
	return this;
};

exports.joinPrefix = function (name, value, prefixes) {
    var i, styles;
	if (!prefixes) {
        return {};
    }
	if (!(prefixes instanceof Array)) {
        prefixes = [prefixes];
    }
	styles = {};
	styles[name] = value;
	name = name[0].toUpperCase() + name.substr(1, name.length - 1);
	for (i = 0; i < prefixes.length; i++) {
		styles[prefixes[i] + name] = value;
	}
	return styles;
};