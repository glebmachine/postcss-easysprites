const { promisify } = require('util');
const lodash = require('lodash');
const spritesmith = promisify(require('spritesmith').run);

const { areAllRetina, getRetinaPadding } = require('./retina-images');
const { cache } = require('./cache');
const { pluginOptions } = require('./plugin-options');

/**
 * Builds the configuration object of options for spritesmith.
 *
 * @param {Array} spriteImages - The array of image objects for spritesmith to
 * build the sprite with.
 * @param {string} spriteGroup - The image group name to use as the sprite name.
 * @returns {object}
 */
function buildSpritesmithConfig(spriteImages, spriteGroup) {
  // Get existing plugin options.
  const opts = pluginOptions.getAllOptions();

  // Merge the src path property and existing plugin options into a new
  // master configuration object for spritesmith.
  const config = Object.assign({}, opts, {
    src: spriteImages.map((image) => image.path),
  });

  // Enlarge padding for retina images.
  if (areAllRetina(spriteImages)) {
    config.padding = getRetinaPadding(spriteImages, config.padding);
  }

  config.spriteName = spriteGroup;

  return config;
}

// function runSpritesmithAsync() {}

/**
 * Run SpriteSmith on the array of images.
 *
 * @param {Array} images - Array of image objects.
 * @returns {Array}
 */
function runSpriteSmith(images) {
  return new Promise((resolve, reject) => {
    const allSprites = lodash
      .chain(images)
      // Group image objects by their concatenated sprite group names.
      .groupBy((image) => image.groups.join(''))
      .map(async (spriteImages, spriteGroup) => {
        const config = buildSpritesmithConfig(spriteImages, spriteGroup);

        // Calculate the sprite cache hash to use for checking if the sprite
        // image has already been generated.
        const cacheHash = cache.createCacheHash(config.src);

        // If a sprite is found in the cache, return it instead of having
        // spritesmith regenerate a new one.
        if (cache.isItemCached(cacheHash)) {
          cache.markAsCached(cacheHash);
          return cache.getCacheItem(cacheHash);
        }

        // Generate the spritesheet with spritesmith.
        const spritesheet = await spritesmith(config).then((result) => result);

        // Append info about sprite group.
        spritesheet.groups = spriteGroup;

        const outdatedSpriteHash = cache.getCacheIndexItem(config.spriteName);

        // Remove any outdated cache items with the same sprite name as the
        // one just generated.
        if (outdatedSpriteHash && cache.isItemCached(outdatedSpriteHash)) {
          cache.removeCacheItem(outdatedSpriteHash);
        }

        // Add the newly generated sprite to the cache.
        cache.addCacheIndexItem(config.spriteName, cacheHash);
        cache.addCacheItem(cacheHash, spritesheet);

        return spritesheet;
      })
      .value();

    Promise.all(allSprites)
      .then((results) => {
        resolve([images, results]);
      })
      .catch((err) => reject(err));
  }).catch((err) => {
    throw new Error(`Spritesmith failed to generate sprites. ${err}`);
  });
}

exports.runSpriteSmith = runSpriteSmith;
