const { promisify } = require('util');
const lodash = require('lodash');
const path = require('path');
const { writeFile } = require('fs');
const mkdirp = promisify(require('mkdirp'));
const ansi = require('ansi-colors');
const { log } = require('./log');
const { pluginOptions } = require('./plugin-options');

const writeFileAsync = promisify(writeFile);

/**
 * Map properties for every image.
 *
 * @param {Array} images - An array of image objects.
 * @param {Array} sprites - Array of sprite file object data.
 * @returns {Array}
 */
function mapSpritesProperties(images, sprites) {
  const spriteProperties = sprites.map((sprite) => {
    return lodash.map(sprite.coordinates, (coordinates, imagePath) => {
      // Retrieve the existing image object with the same image path.
      const matchingImage = images.find(
        (element) => element.path === imagePath
      );

      // Add the sprite information to the image object and return a copy
      // of the object.
      return Object.assign(matchingImage, {
        coordinates,
        spritePath: sprite.path,
        properties: sprite.properties,
      });
    });
  });

  return [images, spriteProperties];
}

/**
 * Write the actual sprite image file.
 *
 * @param {object} spriteElement - The sprite element that will be saved.
 * @returns {Promise}
 */
function saveSpriteFile(spriteElement) {
  const opts = pluginOptions.getOptions();
  const sprite = spriteElement;

  // Build the full path the sprite file should be saved to.
  sprite.path = path.resolve(opts.spritePath, `${sprite.groups}.png`);

  // If the sprite is being pulled from the cache, don't save a new version.
  if (sprite.isFromCache) {
    log('Easysprites:', ansi.green(sprite.path), 'unchanged.');
    return sprite;
  }

  // Save new version of the sprite image file.
  return writeFileAsync(sprite.path, Buffer.from(sprite.image, 'binary')).then(
    () => {
      log('Easysprites:', ansi.yellow(sprite.path), 'generated.');
      return sprite;
    }
  );
}

/**
 * Save the sprite images.
 *
 * @param {Array} images - An array of image objects.
 * @param {Array} sprites - Array of sprite file object data.
 * @returns {Array}
 */
async function saveSprites(images, sprites) {
  const opts = pluginOptions.getOptions();

  return mkdirp(opts.spritePath)
    .then(async () => {
      const finished = await Promise.all(
        sprites.map((sprite) => saveSpriteFile(sprite))
      )
        .then((allSprites) => {
          return allSprites;
        })
        .catch((error) => {
          throw new Error(`Sprite file failed to save. ${error}`);
        });

      return [images, finished];
    })
    .catch((error) => {
      throw new Error(
        `The directory ${opts.spritePath} could not be created. ${error}`
      );
    });
}

exports.mapSpritesProperties = mapSpritesProperties;
exports.saveSprites = saveSprites;
