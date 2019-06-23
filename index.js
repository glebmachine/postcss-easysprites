const path = require('path');
const postcss = require('postcss');
const Q = require('q');

const { runSpriteSmith } = require('./lib/run-spritesmith');
const { updateReferences } = require('./lib/update-references');
const { applyGroupBy } = require('./lib/apply-group-by');
const { collectImages } = require('./lib/collect-images');
const { setTokens } = require('./lib/tokens');
const { mapSpritesProperties, saveSprites } = require('./lib/sprites');

/**
 * postcss-easysprites module.
 * @module postcss-easysprites
 * @param {processOptions} [options] Options passed to the plugin.
 */
module.exports = postcss.plugin('postcss-easysprites', (options) => {
  // Options.
  const opts = options || {};

  opts.groupBy = opts.groupBy || [];
  opts.padding = opts.padding ? opts.padding : 20;

  // Paths.
  opts.imagePath = path.resolve(process.cwd(), opts.imagePath || '');
  opts.spritePath = path.resolve(process.cwd(), opts.spritePath || '');

  // Group retina images.
  opts.groupBy.unshift((image) => {
    if (image.ratio > 1) {
      return `@${image.ratio}x`;
    }

    return null;
  });

  return (css) => {
    // if file path
    return (
      Q

        // prepare part
        .all([collectImages(css, opts), opts])
        .spread(applyGroupBy)
        .spread((images, tokenOptions) => {
          return setTokens(images, tokenOptions, css);
        })

        // compilation part
        .spread(runSpriteSmith)
        .spread(saveSprites)
        .spread(mapSpritesProperties)
        .spread((images, spriteOptions, sprites) => {
          return updateReferences(images, spriteOptions, sprites, css);
        })
    );
  };
});
