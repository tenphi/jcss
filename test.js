var jcss = require('./jcss.js');
var render = jcss.render;
var fs = require('fs');

var mixins = jcss.mixins;

module.exports = {
    simple: {
        max: function (test) {
            var css = {
                '.class': {
                    style1: 'value',
                    style2: 20
                }
            };
            var result = '.class {\r\n' +
                '  style1: value;\r\n' +
                '  style2: 20;\r\n' +
                '}\r\n\r\n';
            test.deepEqual(render(css), result);
            test.done();
        },
        min: function (test) {
            var css = {
                '.class': {
                    style1: 'value',
                    style2: 20
                }
            };
            var result = '.class{style1:value;style2:20;}';
            test.deepEqual(render(css, true), result);
            test.done();
        }
    },
    hierarchy: function(test) {
        var css = {
            '.class1': {
                style1: 'red',
                ' .class2': {
                    style2: 'blue'
                }
            }
        };
        var result = '.class1{style1:red;}.class1 .class2{style2:blue;}';
        test.deepEqual(render(css, true), result);
        test.done();
    },
    split: function(test) {
        var css = {
            '.class1|.class2': {
                style1: 'red',
                ' .class3| .class4': {
                    style2: 'blue'
                }
            }
        };
        var result = '.class1{style1:red;}.class1 .class3{style2:blue;}.class1 .class4{style2:blue;}.class2{style1:red;}.class2 .class3{style2:blue;}.class2 .class4{style2:blue;}';
        test.deepEqual(render(css, true), result);
        test.done();
    },
    extend: function(test) {
        var css = {
            '.class1': {
                style1: 'red',
                ' class2': {
                    style1: 'blue'
                }
            },
            '.class1 ': {
                style1: 'blue',
                'class2': {
                    style: 'red'
                }
            }
        };
        var result = '.class1{style1:blue;}.class1 class2{style:red;}';
        test.deepEqual(render(css, true), result);
        test.done();
    },
    extra: function(test) {
        var css = {
            '@media (max-width=980)': {
                '.class1': {
                    style1: 'red',
                    ' .class2': {
                        style2: 'blue'
                    }
                }
            },
            '.class1': {
                '@media (max-width=980)': {
                    style1: 'blue',
                    ' .class2': {
                        style2: 'red'
                    }
                }
            }
        };
        var result = '@media (max-width=980){.class1{style1:blue;}.class1 .class2{style2:red;}}';
        test.deepEqual(render(css, true), result);
        test.done();
    },
    mixin: {
        simple: function(test) {
            var css = {
                '.class1': {
                    size: '200px 100px'
                }
            };
            var result = '.class1{width:200px;height:100px;}';
            test.deepEqual(render(css, true), result);
            test.done();
        },
        define: function(test) {
            var css = {
                '.class1': {
                    borderRadius: '5px'
                }
            };
            var result = '.class1{-webkit-border-radius:5px;-moz-border-radius:5px;border-radius:5px;}';
            jcss.mixins = {
                borderRadius: function(val) {
                    return {
                        WebkitBorderRadius: val,
                        MozBorderRadius: val,
                        borderRadius: val
                    }
                }
            };
            test.deepEqual(render(css, true), result);
            jcss.mixins = mixins;
            test.done();
        },
        inserted: function(test) {
            var css = {
                '.class1': {
                    size: '200 100'
                }
            };
            jcss.mixins = {
                size: mixins.size,
                width: function(val) {
                    return {width: val + 'px'};
                },
                height: function(val) {
                    return {height: val + 'px'};
                }
            };
            var result = '.class1{width:200px;height:100px;}';
            test.deepEqual(render(css, true), result);
            jcss.mixins = mixins;
            test.done();
        }
    },
    customObject: function(test) {
        var cons = function Test() {};
        cons.prototype.toString = function() {
            return '100px';
        };
        var css = {
            '.class1': {
                'width': new cons()
            }
        };
        var result = '.class1{width:100px;}';
        test.deepEqual(render(css, true), result);
        test.done();
    }
};
