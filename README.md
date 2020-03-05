# PostCSS Easysprite [![Build Status](https://travis-ci.org/glebmachine/postcss-easysprites.svg?branch=master)](https://travis-ci.org/glebmachine/postcss-easysprites) [![npm version](https://badge.fury.io/js/postcss-easysprites.svg)](http://badge.fury.io/js/postcss-easysprites) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Usage

Just append `#spritename` to the end of the image url. No complicated mechanism or strict folder structure is needed.

## Retina

The plugin moves all retina images with any ratio to a separate sprite. To achieve this all retina images should be declared with a `@2x` suffix (where number is the image ratio.)

## Caching/performance

Projects with a large number of sprites can take a long time to compile. The help with this, the plugin checks files against a md5 hash to only compile new/changed sprites. This does not yet work for the [first time a sprite is generated](https://github.com/glebmachine/postcss-easysprites/issues/5).

## Relative/absolute paths

The plugin supports both relative and absolute paths on input file, but can currently only [generate relative paths on output file](https://github.com/glebmachine/postcss-easysprites/issues/4).

## Plugin options

| Option | Description | Default |
| --- | --- | --- |
| `imagePath` | Path for resolving absolute images. | `process.cwd()` |
| `spritePath` | Path to use for saving the generated sprites file(s). | `process.cwd()` |
| `stylesheetPath` | Path for resolving relative images (overriding options, css file folder used for default.) | `''` |
| `padding` | The amount of space in pixels to put around images in the sprite. _**Note:**_ This value will be scaled proportionally for retina images. | `20` |
| `outputDimensions` | Whether to also output the pixel `height` and `width` of the image. | `false` |
| `algorithm` | The [layout algorithm](https://github.com/twolfson/layout) spritesmith should use. | `binary-tree` |
| `outputStylesheetPath` | Optional. Path of the final CSS file. If defined, sprite urls are relative to this path. | `undefined` |

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

See the [PostCSS](https://postcss.org) docs for examples of your particular environment.
