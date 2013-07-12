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
custom application (`core/preprocessor[Application]`). This replaces
`DocumentResources.prototype.addStyle` to inject compiled CSS text instead of
loading the CSS file through a link tag.

This method is used because it's the earliest we can get into the Montage
ecosystem. Any later and CSS from components in index.html would not get
compiled.

### Patches to rework

Some of the rework modules don't work in the browser, and so those are
injected by `core/preprocessor.js` so they are not loaded.

Some of the modules use an `index.js` module, but don't specifiy a `main`
property in the `package.json`, and so I have checked those in an patched them.
