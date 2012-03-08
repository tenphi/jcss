var jss = require('../lib/jss');
var styles = require('./styles');

jss.mixin('borderRadius', function(value) {
    return jss.join({borderRadius: value}, ['Moz', 'Webkit']);
});

console.log(jss.render(styles));

//console.log(jss.render(styles, true));