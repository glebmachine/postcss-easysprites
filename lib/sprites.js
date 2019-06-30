const { promisify } = require('util');
const lodash = require('lodash');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const ansi = require('ansi-colors');
const { log } = require('./log');

/**
 * Generate a path to the sprite.
 *
 * @param {object} opts - Options passed to the plugin.
 * @param {Array} groups - Array of sprint groups.
 * @returns {string}
 */
function makeSpritePath(opts, groups) {
  const base = opts.spritePath;
  const file = path.resolve(base, `${groups.join('.')}.png`);
  return file.replace('.@', '@');
}

/**
 * Map properties for every image.
 *
 * @param {Array} images - An array of image objects.
 * @param {object} opts - Options passed to the plugin.
 * @param {Array} sprites - Array of sprite file object data.
 * @returns {Promise}
 */
function mapSpritesProperties(images, opts, sprites) {
  return new Promise((resolve) => {
    const spriteProperties = sprites.map((sprite) => {
      return lodash.map(sprite.coordinates, (coordinates, imagePath) => {
        return lodash.merge(
          images.find((element) => element.path === imagePath),
          {
            coordinates,
            spritePath: sprite.path,
            properties: sprite.properties,
          }
        );
      });
    });

    resolve([images, opts, spriteProperties]);
  });
}

/**
 * Save the sprite image.
 *
 * @param {Array} images - An array of image objects.
 * @param {object} opts - Options passed to the plugin.
 * @param {Array} sprites - Array of sprite file object data.
 * @returns {Promise}
 */
function saveSprites(images, opts, sprites) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(opts.spritePath)) {
      mkdirp.sync(opts.spritePath);
    }

    const all = lodash
      .chain(sprites)
      .map((spriteElement) => {
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
      })
      .value();

    Promise.all(all)
      .then((allSprites) => {
        resolve([images, opts, allSprites]);
      })
      .catch((err) => {
        if (err) {
          reject(err);
        }
      });
  });
}

exports.makeSpritePath = makeSpritePath;
exports.mapSpritesProperties = mapSpritesProperties;
exports.saveSprites = saveSprites;
