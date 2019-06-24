# PostCSS Easysprite [![Build Status](https://travis-ci.org/glebmachine/postcss-easysprites.svg?branch=master)](https://travis-ci.org/glebmachine/postcss-easysprites) [![npm version](https://badge.fury.io/js/postcss-easysprites.svg)](http://badge.fury.io/js/postcss-easysprites) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Usage

Just append `#spritename` to the end of image url. No complicated mechanism or strict folder structure.

## Retina

Plugin moving all retina images, with any ratio to separate sprite. To achieve this all retina images should be declarated with `@2x` suffix (where number is image ratio).

## Caching/performance

Large project got huge time to compile. This plugin check your files md5 and compile only new sprites. No more silly work! (not first time, yet)

## Relative/absolute paths

Plugin support relative/absolute paths on input file, but still can generate only relative paths on output file (i'm working on it)

## Plugin options

- `imagePath` path for resolving absolute images.
- `spritePath` path to use for saving the generated sprites file(s).
- `stylesheetPath` path for resolve relative images (overriding options, css file folder used for default).
- `padding` the amount of space in pixels to put around images in the sprite. Default: `20`
- `outputDimensions` whether to also output the pixel `height` and `width` of the sprite. This value will be scaled proportionally for retina images. Default: `false`
- `algorithm` the [layout algorithm](https://github.com/twolfson/layout) spritesmith should use. Default: 'binary-tree'

## Input example

```css
.arrow {
  background-image: url('images/arrow-next.png#elements');
}
.arrow:hover {
  background-image: url('images/arrow-next--hover.png#elements');
}

@media only screen and (min-resolution: 1.5dppx) {
  .arrow {
    background-image: url('images/arrow-next@2x.png#elements');
  }
  .arrow:hover {
    background-image: url('images/arrow-next--hover@2x.png#elements');
  }
}

@media only screen and (min-resolution: 2.5dppx) {
  .arrow {
    background-image: url('images/arrow-next@3x.png#elements');
  }
  .arrow:hover {
    background-image: url('images/arrow-next--hover@3x.png#elements');
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
  background-position: -48px 0;
}

@media only screen and (min-resolution: 1.5dppx) {
  .arrow {
    background-image: url(sprites/elements@2x.png);
    background-position: 0 0;
    background-size: 76px 27px;
  }

  .arrow:hover {
    background-image: url(sprites/elements@2x.png);
    background-position: -48px 0;
    background-size: 76px 27px;
  }
}

@media only screen and (min-resolution: 2.5dppx) {
  .arrow {
    background-image: url(sprites/elements@3x.png);
    background-position: 0 0;
    background-size: 76px 27px;
  }

  .arrow:hover {
    background-image: url(sprites/elements@3x.png);
    background-position: -48px 0;
    background-size: 76px 27px;
  }
}
```

## PostCSS Usage

```js
postcss([
  easysprite({
    imagePath: './public/images',
    spritePath: './public/sprites',
  }),
]);
```

See [PostCSS](https://postcss.org/) docs for examples for your environment.
