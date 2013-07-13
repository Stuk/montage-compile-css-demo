# Compiled CSS in Montage

A proof of concept to show how CSS could be compiled in Montage. Based on
[rework](https://github.com/visionmedia/rework). It just uses the
rework-vars plugin to add CSS variables (for example to define global
colours to be used throughout the app's CSS), although of course more
plugins could be added.

Interesting files:

 * [core/preprocessor.js](core/preprocessor.js)
 * [ui/thing.reel/thing.css](ui/thing.reel/thing.css)
 * [css-variables.json](css-variables.json)

Try it out by cloning this repo and running `npm install` in the
directory, and then visiting `index.html` through a web server.

## Syntax

Within CSS you can use the syntax described by
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

## Known issues

 * URLS (`url(thing.png)`) are not rebased, and so will be broken.
 * This does not integrate with Mop and so even in production, the CSS will be
   compiled at runtime.

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
property in the `package.json`, and so I have checked them in and patched them
to include this property.
