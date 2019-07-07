const { promisify } = require('util');
const lodash = require('lodash');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const ansi = require('ansi-colors');
const { log } = require('./log');
const { pluginOptions } = require('./plugin-options');

/**
 * Generate a path to the sprite.
 *
 * @param {object} opts - Options passed to the plugin.
 * @param {Array} groups - Array of sprint groups.
 * @returns {string}
 */
function makeSpritePath(opts, groups) {
  const base = opts.spritePath;

  const file = path.resolve(base, `${groups}.png`);

  return file;
}

/**
 * Map properties for every image.
 *
 * @param {Array} images - An array of image objects.
 * @param {Array} sprites - Array of sprite file object data.
 * @returns {Array}
 */
function mapSpritesProperties(images, sprites) {
  return new Promise((resolve) => {
    const spriteProperties = sprites.map((sprite) => {
      return lodash.map(sprite.coordinates, (coordinates, imagePath) => {
        return Object.assign(
          images.find((element) => element.path === imagePath),
          {
            coordinates,
            spritePath: sprite.path,
            properties: sprite.properties,
          }
        );
      });
    });

    resolve([images, spriteProperties]);
  });
}

/**
 * Write the actual sprite image file.
 *
 * @param {object} spriteElement - The sprite element that will be saved.
 * @returns {Promise}
 */
function saveSpriteFile(spriteElement) {
  const opts = pluginOptions.getAllOptions();

  const sprite = spriteElement;

  sprite.path = makeSpritePath(opts, sprite.groups);

  // Check if this file is up to date.
  if (sprite.isFromCache) {
    return new Promise((res) => {
      log('Easysprites:', ansi.green(sprite.path), 'unchanged.');
      res(sprite);
    });
  }

  const writeFile = promisify(fs.writeFile);

  // Save new file version.
  return writeFile(sprite.path, Buffer.from(sprite.image, 'binary')).then(
    () => {
      log('Easysprites:', ansi.yellow(sprite.path), 'generated.');

      return sprite;
    }
  );
}

/**
 * Save the sprite image.
 *
 * @param {Array} images - An array of image objects.
 * @param {Array} sprites - Array of sprite file object data.
 * @returns {Array}
 */
function saveSprites(images, sprites) {
  const opts = pluginOptions.getAllOptions();

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(opts.spritePath)) {
      mkdirp.sync(opts.spritePath);
    }

    const all = lodash
      .chain(sprites)
      .map((spriteElement) => saveSpriteFile(spriteElement))
      .value();

    Promise.all(all)
      .then((allSprites) => {
        resolve([images, allSprites]);
      })
      .catch((err) => reject(err));
  });
}

exports.makeSpritePath = makeSpritePath;
exports.mapSpritesProperties = mapSpritesProperties;
exports.saveSprites = saveSprites;
