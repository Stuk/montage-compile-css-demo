# Compiled CSS in Montage

A proof of concept to show how "CSS" could be compiled in Montage.

## Syntax

It's very hacky. Within CSS you can use the syntax described by
[rework-vars](https://github.com/visionmedia/rework-vars):

```css
:root {
  var-header-color: #06c;
  var-main-color: #c06;
}

div {
  var-accent-background: linear-gradient(to top, var(main-color), white);
}
```

or you can define global CSS variables in `css-variables.json`.

## Implementation

Uses the `applicationPrototype` property of the `package.json` to load a
custom application. This replaces `DocumentResources.prototype.addStyle` to
inject compiled CSS text instead of loading the CSS file through a link tag.
