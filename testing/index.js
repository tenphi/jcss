var jcss = require('../jcss');
var styles = require('./styles');

jcss.mixin('borderRadius', function(value) {
    return jcss.join({borderRadius: value}, ['Moz', 'Webkit']);
});

console.log(jcss.render(styles));

console.log(jcss.render(styles, true));