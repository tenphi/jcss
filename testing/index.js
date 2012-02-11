var jss = require('../lib/jss');
var styles = require('./styles');

console.log(jss.render(styles));

console.log(jss.render(styles, true));