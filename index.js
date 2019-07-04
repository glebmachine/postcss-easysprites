const postcss = require('postcss');
const { pluginOptions } = require('./lib/plugin-options');
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
  return (css) => {
    // Setup options.
    pluginOptions.init(options);
    pluginOptions.setStylesheetPath(
      options.stylesheetPath,
      css.source.input.file
    );

    return Promise.all([collectImages(css)])
      .then(([imageCollection]) => {
        return applyGroupBy(imageCollection);
      })
      .then(([images]) => {
        return setTokens(images, css);
      })
      .then(([images]) => {
        return runSpriteSmith(images);
      })
      .then(([images, results]) => {
        return saveSprites(images, results);
      })
      .then(([images, sprites]) => {
        return mapSpritesProperties(images, sprites);
      })
      .then(([images, sprites]) => {
        return updateReferences(images, sprites, css);
      })
      .catch((err) => {
        if (err) {
          throw new Error(err);
        }
      });
  };
});
