const path = require('path');
const postcss = require('postcss');
const { runSpriteSmith } = require('./lib/run-spritesmith');
const { updateReferences } = require('./lib/update-references');
const { applyGroupBy } = require('./lib/apply-group-by');
const { collectImages } = require('./lib/collect-images');
const { setTokens } = require('./lib/tokens');
const { isLayout } = require('./lib/layouts');
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

  opts.algorithm = opts.algorithm || 'binary-tree';

  // Check that the layout algorithm is valid.
  isLayout(opts.algorithm);

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
    return Promise.all([collectImages(css, opts), opts])
      .then(([imageCollection, spriteOpts]) => {
        return applyGroupBy(imageCollection, spriteOpts);
      })
      .then(([images, spriteOpts]) => {
        return setTokens(images, spriteOpts, css);
      })
      .then(([images, spriteOpts]) => {
        return runSpriteSmith(images, spriteOpts);
      })
      .then(([images, spriteOpts, results]) => {
        return saveSprites(images, spriteOpts, results);
      })
      .then(([images, spriteOpts, sprites]) => {
        return mapSpritesProperties(images, spriteOpts, sprites);
      })
      .then(([images, spriteOptions, sprites]) => {
        return updateReferences(images, spriteOptions, sprites, css);
      });
  };
});
