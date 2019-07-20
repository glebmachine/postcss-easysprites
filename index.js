const postcss = require('postcss');
const { pluginOptions } = require('./lib/plugin-options');
const { runSpritesmith } = require('./lib/run-spritesmith');
const { updateReferences } = require('./lib/update-references');
const { addSpriteGroups } = require('./lib/sprite-groups');
const { collectImages } = require('./lib/collect-images');
const { setTokens } = require('./lib/tokens');
const { mapSpritesProperties, saveSprites } = require('./lib/sprites');

/**
 * postcss-easysprites module.
 * @module postcss-easysprites
 * @param {processOptions} [options] Options passed to the plugin.
 */
module.exports = postcss.plugin('postcss-easysprites', (options) => {
  return (css) => {
    // Setup options.
    pluginOptions.init(options, css.source.input.file);

    return Promise.all([collectImages(css)])
      .then(([images]) => {
        return addSpriteGroups(images);
      })
      .then(([images]) => {
        return setTokens(images, css);
      })
      .then(([images]) => {
        return runSpritesmith(images);
      })
      .then(([images, sprites]) => {
        return saveSprites(images, sprites);
      })
      .then(([images, sprites]) => {
        return mapSpritesProperties(images, sprites);
      })
      .then(([images, sprites]) => {
        return updateReferences(images, sprites, css);
      })
      .catch((err) => {
        throw new Error(err);
      });
  };
});
