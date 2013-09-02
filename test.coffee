jcss = require './jcss.js'
render = jcss.render
fs = require 'fs'
assert = require('chai').assert

describe 'simple structures', ->

  css =
    '.class':
      style1: 'value'
      style2: 20

  it 'plain styles', ->
    res = """
          .class {
            style1: value;
            style2: 20;
          }


          """
    assert.strictEqual render(css), res

  it 'minified styles', ->
    res = ".class{style1:value;style2:20;}"
    assert.strictEqual render(css, true), res

describe 'multiselector', ->

  it 'selectors', ->
    css =
      '.class1':
        style1: 'value'
      '.class2':
        style2: 'value'
    res = '.class1{style1:value;}.class2{style2:value;}';
    assert.strictEqual render(css, true), res

describe 'hierarchy', ->

  it 'normal join', ->
    css =
      '.class1':
        style1: 'red'
        '.class2':
          style2: 'blue'
    res = '.class1{style1:red;}.class1 .class2{style2:blue;}'
    assert.strictEqual render(css, true), res

  it 'left join', ->
    css =
      '.class1':
        style1: 'red'
        '&-inner2':
          style2: 'blue'
    res = '.class1{style1:red;}.class1-inner2{style2:blue;}'
    assert.strictEqual render(css, true), res

  it 'normal join', ->
    css =
      '.class1':
        style1: 'red'
        '.class2 &':
          style2: 'blue'
    res = '.class1{style1:red;}.class2 .class1{style2:blue;}'
    assert.strictEqual render(css, true), res

describe 'difficult structure', ->

  it 'split', ->
    css =
      '.class1|.class2':
        style1: 'red'
        '&-inner3|.class4 &':
          style2: 'blue'
      '-inner3':
        '.class1&':
          style2: 'green'
    res = '.class1{style1:red;}.class1-inner3{style2:green;}.class4 .class1{style2:blue;}.class2{style1:red;}.class2-inner3{style2:blue;}.class4 .class2{style2:blue;}'
    assert.strictEqual render(css, true), res

  it 'extend', ->
    css =
      '.class1':
        style1: 'red'
        '.class2':
          style1: 'blue'
      '.class1':
        style1: 'blue'
        '.class2':
          style: 'red'
    res = '.class1{style1:blue;}.class1 .class2{style:red;}'
    assert.strictEqual render(css, true), res

describe 'extra', ->

  it '@media', ->
    css =
      '@media (max-width=980)':
        '.class1':
          style1: 'red'
          '.class2':
            style2: 'blue'
      '.class1':
        '@media (max-width=980)':
          style1: 'blue'
          '.class2':
            style2: 'red'
    res = '@media (max-width=980){.class1{style1:blue;}.class1 .class2{style2:red;}}'
    assert.strictEqual render(css, true), res

  it '@font-face', ->
    css =
      '@font-face': [
        fontFamily: 'FontName1'
        src: 'url(fontname1.otf)'
      ,
        fontFamily: 'FontName2'
        src: 'url(fontname2.otf)'
      ]
    res = '@font-face{font-family:FontName1;src:url(fontname1.otf);}@font-face{font-family:FontName2;src:url(fontname2.otf);}'
    assert.strictEqual render(css, true), res

  it '@import', ->
    css =
      '@import': [
        'url("one.css") all'
        'url("two.css") all'
      ]
    res = '@import url("one.css") all;@import url("two.css") all;'
    assert.strictEqual render(css, true), res

describe 'mixins', ->

  mixins = jcss.mixins

  it 'simple', ->
    css =
      '.class1':
        size: '200px 100px'
    res = '.class1{width:200px;height:100px;}';
    assert.strictEqual render(css, true), res

  it 'define', ->
    css =
      '.class1':
        borderRadius: '5px'
    res = '.class1{-webkit-border-radius:5px;-moz-border-radius:5px;border-radius:5px;}'
    jcss.mixins =
      borderRadius: (val) ->
        WebkitBorderRadius: val
        MozBorderRadius: val
        borderRadius: val
    assert.strictEqual render(css, true), res
    jcss.mixins = mixins

  it 'inserted', ->
    css =
      '.class1':
        size: '200 100'
    jcss.mixins =
      size: mixins.size
      width: (val) ->
        width: val + 'px'
      height: (val) ->
        height: val + 'px'
    res = '.class1{width:200px;height:100px;}'
    assert.strictEqual render(css, true), res
    jcss.mixins = mixins

describe 'custom object', ->

  it 'example', ->
    class Test
      toString: -> '100px'
    css =
      '.class1':
        width: new Test
    res = '.class1{width:100px;}'
    assert.strictEqual render(css, true), res