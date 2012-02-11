### Wrote your styles in javascript!
Set your style sheets as module of your application!

```javascript
/* styles.js */
module.exports = {
    '#mydiv': {
        color: '#333',
        font: '13px/18px Helvetica'
    }
}
```

### Example using with Express
Add your styles to application:

```javascript
/* app.js */
var app = require('express').createServer();
var jss = require('jss');
var styles = require('./styles');
/* ... */
app.configure('development', function() {
    app.get('/styles.css', function(req, res) {
        res.send(jss.render(styles)); // full css
    });
});
app.configure('production', function() {
    app.get('/styles.css', function(req, res) {
        res.send(jss.render(styles, true)); // minified
    });
});
```

Check *styles.css* in your browser.

```css
/* http://localhost/styles.css */
#mydiv {
    color: #333;
    font: 13px/18px Helvetica;
}
```

### Use namespaces and splits

```javascript
module.exports = {
    '#mydiv': {
        color: '#333',
        ' div': { // #mydiv div
            color: '#666'
        },
        '.highlight': { // #mydiv.highlight
            backgroundColor: '#fff'
        }
    },
    '.button-|.big-button-': {
        'red': { // .button-red, .big-button-red
            color: 'red'
        },
        'blue': { // .button-blue, .big-button-blue
            color: 'blue'
        },
        'red|blue': { // .button-red, .button-blue, .big-button-red, .big-button-blue
            backgroundColor: '#fff'
        }
    }
}
```

### Multiple styles
You can set many values of one style:

```javascript
module.exports = {
    '.button': {
        background: [
            'linear-gradient(top, #ffffff, #e6e6e6)',
            '-moz-linear-gradient(top, #ffffff, #e6e6e6)',
            '-webkit-linear-gradient(top, #ffffff, #e6e6e6)'
        ]
    }
}
```

### Create mixins

```javascript
/* app.js */
var jss = require('jss');
jss.handler('borderRadius', function(value) {
    /* auto join */
    return jss.joinPrefixes({borderRadius: value}, ['Moz', 'Webkit']);
    /* or manual */
    return {
        borderRadius: value,
        MozBorderRadius: value,
        WebkitBorderRadius: value
    }
});

/* styles */
module.exports = {
    '.rounded': {
        borderRadius: '5px'
    }
}
```

### Media Types

```javascript
module.exports = {
    '@media (min-width: 600px)': {
        '#hello': {
            width: '980px'
        }
    }
}
```

### Use JSS with Node-Color - https://github.com/Tenphi/node-color

```javascript
var color = require('color');
module.exports = {
    '#mydiv': {
        backgroundColor: color('#39f').desaturate(.5).lighten(.2);
    }
}
```