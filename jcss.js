/*!
* JCSS
* Copyright(c) 2012 Andrey Yamanov <tenphi@gmail.com>
* MIT Licensed
* @version 0.4.0
*/

(function() {
    

var init = (function() {
    
    var isArray = Array.isArray || function(arr) {
            return arr instanceof Array;
        },
        map = function(elems, callback, arg) {
            var ret = [];
            if (isArray(elems)) {
                for(var i = 0, len = elems.length; i < len; i++) {
                    var value = callback(elems[i], i, arg);
                    if (value != null) {
                        ret.push(value);
                    }
                }
            } else if (isPlainObject(elems)) {
                for (var name in elems) {
                    var value = callback(elems[name], name, arg);
                    if (value != null) {
                        ret.push(value);
                    }
                }
            } else {
                return elems;
            }
            
            return ret.concat.apply([], ret);
        },
        isNumeric = function(num) {
            return typeof(num) === 'number';
        },
        isPlainObject = function( obj ) {
            if ( !obj || typeof(obj) !== "object" || obj.nodeType || obj === window ) {
                return false;
            }

            try {
                if ( obj.constructor &&
                    !Object.hasOwnProperty.call(obj, "constructor") &&
                    !Object.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
                    return false;
                }
            } catch ( e ) {
                return false;
            }
            
            var key;
            for ( key in obj ) {}

            return key === undefined || Object.hasOwnProperty.call( obj, key );
        },
        clone = function clone(obj){
            if(obj == null || typeof(obj) != 'object')
                return obj;

            var temp = obj.constructor();

            for(var key in obj)
                temp[key] = clone(obj[key]);
            return temp;
        },
        isString = function(value) {
            return typeof(value) === 'string';
        };
	
    var jcss = {
        
        /* active or not */
        status: true,
        
        on: function() {
            this.status = true;
        },
        
        off: function() {
            this.status = false;
        },
        
        render: function (css, minified, namespace, offset) {
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

            if (!isPlainObject(css)) {
                throw {message: 'jcss: wrong input data'};
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
            
            css = this.normalize(clone(css));
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
                out += offset + dec.tab + fixedStyle + dec.mid + value + ';' + dec.nl;
            }
            
            return out;
        },
        
        normalize: function(styles) {
            var newstyles, selector, sel, options, style, style2, name, i, temp, temp2, fselector, flag;
            for (selector in styles) {
                if (isPlainObject(styles[selector][''])) {
                    for (style in styles[selector]['']) {
                        if (isPlainObject(styles[selector][style])) {
                            continue;
                        }
                        styles[selector][style] = styles[selector][''][style];
                    }
                    delete styles[selector][''];
                }
            }
            for (selector in styles) {
                if (selector.substr(0, 6) == '@media') {
                    styles[selector] = this.normalize(styles[selector]);
                    continue;
                }
                temp = selector.replace(/\|/g, ',').split(',');
                if (!isPlainObject(styles[selector])) styles[selector] = {};
                for (style in styles[selector]) {
                    if (this.mixins[style] instanceof Function) {
                        options = styles[selector][style];
                        if (!isArray(options)) {
                            options = [options];
                        }
                        for (i = 0; i < options.length; i++) {
                            newstyles = this.mixins[style](options[i]);
                            if (!isPlainObject(newstyles)) {
                                continue;
                            }
                            if (!newstyles[style]) {
                                delete styles[selector][style];
                            } else {
                                styles[selector][style] = newstyles[style];
                                delete newstyles[style];
                            }
                            for (name in newstyles) {
                                if (styles[selector][name]) {
                                    if (isArray(styles[selector][name])) {
                                        styles[selector][name].push(newstyles[name]);
                                    } else if (styles[selector][name] != newstyles[name]) {
                                        styles[selector][name] = [styles[selector][name], newstyles[name]];
                                    }
                                } else {
                                    styles[selector][name] = newstyles[name];
                                }
                            }
                        }
                    } else if (isPlainObject(styles[selector][style])) {
                        temp = style.replace(/\|/g, ',').split(',');
                        newstyles = {};
                        temp2 = selector.replace(/\|/g, ',').split(',');
                        fselector = [];
                        fselector = map(temp2, function(sel) {
                            return sel + temp.join(',' + sel);
                        });
                        fselector = fselector.join(',');
                        newstyles[fselector] = clone(styles[selector][style]);
                        newstyles = this.normalize(newstyles);
                        for (sel in newstyles) {
                            if (!isPlainObject(styles[sel])) styles[sel] = {};
                            for (style2 in newstyles[sel]) {
                                styles[sel][style2] = newstyles[sel][style2];
                            }
                        }
                        delete styles[selector][style];
                    } else if (typeof(styles[selector][style]) == 'object') {
                        styles[selector][style] = '' + styles[selector][style];
                    } else if (!isArray(styles[selector][style]) && typeof(styles[selector][style]) != 'string' 
                        && typeof(styles[selector][style]) != 'number') {
                        delete styles[selector][style];
                    }
                }
            }
            /* delete empty selectors */
            for (selector in styles) {
                flag = true;
                for (style in styles[selector]) {
                    flag = false;
                }
                if (flag) delete styles[selector];
            }
            return styles;
        },
        
        mixins: {},
        
        mixin: function(name, mixin) {
            if (!mixin) {
                return this.mixins[name];
            }
            if (!(mixin instanceof Function)) {
                return null;
            }
            this.mixins[name] = mixin;
            this.hook(name, mixin);
            return this;
        },
        
        join: function(styles, prefixes) {
            var i, name, pname, newstyles = {};
            if (!prefixes) {
                return styles;
            }
            if (!isArray(prefixes)) {
                prefixes = [prefixes];
            }
            for (name in styles) {
                pname = name[0].toUpperCase() + name.substr(1, name.length - 1);
                for (i = 0; i < prefixes.length; i++) {
                    newstyles[prefixes[i] + pname] = styles[name];
                }
                newstyles[name] = styles[name];
            }
            return newstyles;
        },
        
        px: function(value) {
            var temp = (value + '').split(/ +/g);
            value = map(temp, function(val) {
                if (Math.round(val).toString() !== 'NaN') {
                    return val + 'px';
                } else {
                    return val;
                } 
            });
            return value.join(' ');
        },
        
        hook: function(name, handler) {
            if (!jcss._jQuery) {
                return;
            }
            var $ = jcss._jQuery;
            if (!$.cssHooks[name]) $.cssHooks[name] = {};
            $.cssHooks[name] = {
                set: function(elem, value) {
                    var styles = handler(value);
                    var elm = $(elem);
                    if (!elm.data('styles')) elm.data('styles', {});
                    styles = elm.data('styles');
                    styles[name] = value;
                    elm.data('styles', styles);
                    for (var style in styles) {
                        if (style in elem.style) {
                            var values = isArray(styles[style]) ? styles[style] : [styles[style]];
                            for (var i=0; i < values.length; i++) {
                                if (isString(values[i]) || isNumeric(values[i])) {
                                    try {
                                        elem.style[style] = values[i];
                                    } catch(e) {}
                                }
                            }
                        }
                    }
                },
                get: function(elem) {
                    var elm = $(elem);
                    var styles = elm.data('styles');
                    if (styles === undefined) return undefined;
                    if (styles[name]) {
                        return styles[name];
                    } else {
                        return undefined;
                    }
                }
            };
        }
        
    };
    
    /* mixins */
    
    var list = ['width', 'height', 'minWidth', 'minHeight',
        'border', 'borderWidth', 'outline', 'outlineWidth',
        'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
        'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'textIndent', 'fontSize', 'lineHeight',
        'left', 'top', 'right', 'bottom', 'borderRadius'
    ];
    
    for (var i = 0, len = list.length; i < len; i++) {
        jcss.mixin(list[i], (function(name) {
            return function(value) {
                var styles = {};
                styles[name] = jcss.px(value);
                return styles;
            }
        })(list[i]));
    }
    
    /* Setup plugin for jQuery */
    
    jcss.jQuery = function($) {
        if (!$) {
            return jcss._jQuery;
        } else {
            jcss._jQuery = $;
            /* support for $.cssHooks() added! */
        }
        return jcss;
    };
    
    return jcss;
    
});

try {
	/* nodejs stuff */
    if (!module.exports) throw '';
    var jcss = init();
	module.exports = jcss;
} catch(e) {
	window.jcss = init();
}

})();