var jss = require('../lib/jss');
var styles = require('./styles');

jss.handler('borderRadius', function(value) {
    return jss.joinPrefixes({borderRadius: value}, ['Moz', 'Webkit']);
});

console.log(jss.render(styles));

//console.log(jss.render(styles, true));