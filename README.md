# PostCSS Easysprite [![Build Status](https://travis-ci.org/glebmachine/postcss-easysprites.svg?branch=master)](https://travis-ci.org/glebmachine/postcss-easysprites) [![npm version](https://badge.fury.io/js/postcss-easysprites.svg)](http://badge.fury.io/js/postcss-easysprites)

## Usage

Just append `#spritename` to the end of image url. No complicated mechanism or strict folder structure.

## Retina

Plugin moving all retina images, with any ratio to separate sprite. To achieve this all retina images should be declarated with `@2x` suffix (where number is image ratio).

## Caching/perfomance

Large project got huge time to compile. This plugin check your files md5 and compile only new sprites. No more silly work! (not first time, yet)

## Relative/absolute paths

Plugin support relative/absolute paths on input file, but still can generate only relative paths on output file (i'm working on it)

## Plugin options

- `imagePath` path for resolve absolute images
- `spritePath` path for write completed sprites
- `stylesheetPath` path for resolve relative images (overriding options, css file folder used for default)

## Input example

```css
.arrow {
  background-image: url('/images/arrow-next.png#elements');
}
.arrow:hover {
  background-image: url('/images/arrow-next_hover.png#elements');
}

@media only screen and (-webkit-min-device-pixel-ratio: 1.5) {
  .arrow {
    background-image: url('images/arrow-next@2x.png#elements');
  }
  .arrow:hover {
    background-image: url('/images/arrow-next_hover@2x.png#elements');
  }
}

@media only screen and (-webkit-min-device-pixel-ratio: 2.5) {
  .arrow {
    background-image: url('images/arrow-next@3x.png#elements');
  }
  .arrow:hover {
    background-image: url('images/arrow-next_hover@3x.png#elements');
  }
}
```

## Output example

```css
.arrow {
  background-image: url(sprites/elements.png);
  background-position: 0 0;
}
.arrow:hover {
  background-image: url(sprites/elements.png);
  background-position: -28px 0;
}

@media only screen and (-webkit-min-device-pixel-ratio: 1.5) {
  .arrow {
    background-image: url(sprites/elements@2x.png);
    background-position: 0 0;
  }
  .arrow:hover {
    background-image: url(sprites/elements@2x.png);
    background-position: -56px 0;
  }
}

@media only screen and (-webkit-min-device-pixel-ratio: 2.5) {
  .arrow {
    background-image: url(sprites/elements@3x.png);
    background-position: 0 0;
  }
  .arrow:hover {
    background-image: url(sprites/elements@3x.png);
    background-position: -84px 0;
  }
}
```

## Usage

```js
postcss([
  easysprite({
    imagePath: './public/images',
    spritePath: './public/sprites',
  }),
]);
```

See [PostCSS] docs for examples for your environment.
