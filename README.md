JCSS [![Build Status](https://travis-ci.org/tenphi/jcss.png)](https://travis-ci.org/tenphi/jcss)
===

Handy CSS Generator

Now you can use Javascript for CSS declaration, and all its power at your fingertips!

You have no need to remember a lot of rules. JCSS uses the simple hierarchical declaration as the most of popular CSS-preprocessors (like LESS, Stylus, Sass), but using of advanced features like mixins will be as easier as you know Javascript. And I hope you know it well.

Knowledge of the CoffeeScript can rise the usability of this library up to the new level! Because it's much more simple language for declarations, you know. In spite of this, all documentation wrote by Javascript.

## Warning

I should warn you that using of this library is not necessary in most of the cases. I recommend you to use any other modern css-framework (that based on CSS instead of JS).
Probably you could find some situations (as I did) where JCSS shows itself. Anyway, use it with caution.

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
  jcss.inject(/* name */, /* object of styles */);
});
```

## Simple rules, great opportunities
Let's try to learn more about JCSS. We can start with simplest example:

```javascript
jcss.render({
    '.class': {
        color: 'black'
    }
});
```

```css
.class {
    color: black;
}
```

You could think that there are no benefits of using JCSS. But hold on, its just a beginning! Magic awaits us!

```javascript
// left join
jcss.render({
    '.class1': {
        color: 'red',
        '.class2': { // '& .class' works as well if you like it
            color: 'black'
        }
    }
});

// right join
jcss.render({
    '.class1': {
        color: 'red',
        '.class2 &': {
            color: 'black'
        }
    }
});
```

```css
/* left join */
.class1 {
    color: red;
}

.class1 .class2 {
    color: black;
}

/* right join */
.class1 {
    color: red;
}

.class2 .class1 {
    color: black;
}
```

It's simple rules for joining selectors for flexible declaration.
But what should we do if we want to create a several values for single style. We can use arrays! Here is an another simple example:

```javascript
jcss.render({
    '.class1': {
        background: [
            'url(bg1.png), url(bg2.png)', // if browser supports multiple backgrounds
            'url(bg.png)' // single background for other browsers
        ]
    }
});
```

```css
.class1 {
    background: url(bg1.png), url(bg2.png);
    background: url(bg.png);
}
```

Now, Let's try to broke up the library with some complex example. Also, we will see how separation of selectors works.

```javascript
jcss.render({
    '.class1, .class2': {
        '.class3, .class4': { // Also, as for clarity, we can use this notation - ' .class3| .class4'
            color: 'black',
            background: 'transparent'
        }
    },
    '.class2 .class3': {
        background: 'blue'
    }
});
```

```css
.class1 .class3 {
    color: black;
    background: transparent;
}

.class1 .class4 {
    color: black;
    background: transparent;
}

.class2 .class3 {
    color: black;
    background: blue;
}

.class2 .class4 {
    color: black;
    background: transparent;
}
```

Well, it's not what we except. It's because JCSS not an optimizer yet. For optimization I recommend libraries like CSSO. JCSS just makes fast code, not small, because redefinitions of styles work in generation step, not in product. It makes your CSS really fast! And you have no need of thinking about are there too much overrides or not.

## Mixins

As many CSS-preprocessors JCSS have mixins as well. But JCSS's mixins are Javascript functions. And it's really cool. Why? Take a look:

```javascript
jcss.mixins['borderRadius'] = function(val) {
    return {
        WebkitBorderRadius: val,
        MozBorderRadius: val,
        borderRadius: val
    };
};
jcss.render({
    '.class': {
        borderRadius: '5px'
    }
});
```

```css
.class {
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
}
```

Wow! Mixins are great, aren't they?

## Variables & More

Javascript provides you many opportunities of generating CSS which are limited only by your imagination. DO WHAT YOU WANT!

```javascript
var width = '100px';
jcss.render(function() {
    var out = {};
    for (var i = 1; i < 10; i++) {
        out['.class' + i] = {
            width: width
        };
    }
    return out;
}());
```

You already know what output should be here :)

## Extras

Don't forget about @-rules. You can use it too, but more flexible. Here is some examples:

### @media and @supports

```javascript
jcss.render({
    '@media (max-width=980)': {
        '.class1': {
            style1: 'red',
            '& .class2': {
                style2: 'blue'
            }
        }
    },
    '.class1': {
        '@media (max-width=980)': {
            style1: 'blue',
            '& .class2': {
                style2: 'red'
            }
        }
    }
});
```

```css
@media (max-width=980) {

    .class1 {
        style1: blue;
    }

    .class1 .class2{
        style2: red;
    }

}
```

Isn't this cool? JCSS overrided the rules.

### @font-face and @page

```javascript
jcss.render({
    '@font-face': {
        fontFamily: 'FontName',
        src: 'url("fontname.otf")'
    },
    '@page :first': {
        margin: '1cm'
    }
});
```

```css
@font-face {
  font-family: FontName;
  src: url("fontname.otf");
}

@page :first {
  margin: 1cm;
}
```

### @import and @charset

```javascript
jcss.render({
    '@charset': '"windows-1251"',
    '@import': '"another.css" all'
});
```

```css
@charset "windows-1251";

@import "another.css" all;
```

Yep! Not so cool. But we can live with that because it is very rare use case.

## Custom Objects as style value

For example, if you have a super color library you may want to use it with JCSS. No problem!

```javascript
var color = new Color('red').lighten(20); // a lighter shade of red
jcss.render({
    '.class': {
        color: color // <- it's our Object! it will transform into string!
    }
});
```

If Color prototype have `toString()` method it would use for getting value of style.

## That's all, folks! :)

## License

(The MIT License)

Copyright (c) 20011-2013 Andrey Yamanov <tenphi@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
