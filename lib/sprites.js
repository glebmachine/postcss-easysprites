const { promisify } = require('util');
const path = require('path');
const { writeFile } = require('fs');
const mkdirp = require('mkdirp');
const ansi = require('ansi-colors');

const writeFileAsync = promisify(writeFile);
const { log } = require('./log');
const { pluginOptions } = require('./plugin-options');

/**
 * Map properties for every image.
 *
 * @param {Array} images - An array of image objects.
 * @param {Array} sprites - Array of sprite file object data.
 * @returns {Array}
 */
function mapSpritesProperties(images, sprites) {
  const spriteProperties = sprites.map((sprite) => {
    const imagePaths = Object.keys(sprite.coordinates);

    return imagePaths.map((imagePath) => {
      // Retrieve the existing image object with the same image path.
      const matchingImage = images.find(
        (element) => element.path === imagePath
      );

      // Add the sprite information to the image object and return a copy
      // of the object.
      return Object.assign(matchingImage, {
        coordinates: sprite.coordinates[imagePath],
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
 * @async
 * @param {object} spriteElement - The sprite element that will be saved.
 * @returns {Promise}
 */
async function saveSpriteFile(spriteElement) {
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
  await writeFileAsync(sprite.path, Buffer.from(sprite.image, 'binary'));

  log('Easysprites:', ansi.yellow(sprite.path), 'generated.');

  return sprite;
}

/**
 * Save the sprite images.
 *
 * @async
 * @param {Array} images - An array of image objects.
 * @param {Array} sprites - Array of sprite file object data.
 * @returns {Array}
 */
async function saveSprites(images, sprites) {
  const opts = pluginOptions.getOptions();

  try {
    await mkdirp(opts.spritePath);
  } catch (error) {
    throw new Error(
      `The directory ${opts.spritePath} could not be created. ${error}`
    );
  }

  try {
    const allSavedSprites = await Promise.all(
      sprites.map((sprite) => saveSpriteFile(sprite))
    );

    return [images, allSavedSprites];
  } catch (error) {
    throw new Error(`Sprite file failed to save. ${error}`);
  }
}

module.exports.mapSpritesProperties = mapSpritesProperties;
module.exports.saveSprites = saveSprites;
