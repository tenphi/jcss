JCSS
===

Handy CSS Generator

## Getting started
Install via NPM...

```
$ npm install jcss
```

... or add script to your web page.

```html
<script type="text/javascript" src="/path/to/jcss.js"></script>
```

... or install script via bower and add via requirejs.

```bash
bower install git://github.com/tenphi/jcss.git
```

```javascript
require(['./components/jcss/jcss'], function(jcss) {
  jml.inject(/* name */, /* styles */);
});
```

## Render styles

Simple example of css generation

```javascript
var css = {
    '.class1|.class2': {
        style1: 'red',
        ' .class3| .class4': { // '& .class3| .class4' as well
            style2: 'blue'
        }
    }
};
console.log(jcss.render(css));
```

and result is:

```css
.class1 {
    style1:red;
}

.class1 .class3 {
    style2:blue;
}

.class1 .class4 {
    style2:blue;
}

.class2{
    style1:red;
}

.class2 .class3 {
    style2:blue;
}

.class2 .class4{
    style2:blue;
}
```

##Full documentation is coming soon
