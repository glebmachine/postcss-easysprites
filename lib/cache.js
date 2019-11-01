const fs = require('fs');
const md5 = require('md5');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);

/**
 * Custom module to cache sprite images so unchanged sprites don't need to be
 * processed by Spritesmith.
 */
const cache = {
  cache: {},
  cacheIndex: {},

  async createCacheHash(imagePaths) {
    const allPromisedCacheHashes = imagePaths.map(async (imagePath) => {
      try {
        const image = await readFileAsync(imagePath);
        return `${imagePath}=${md5(image.toString())}`;
      } catch (error) {
        return undefined;
      }
    });

    const cacheHashes = await Promise.all(allPromisedCacheHashes);

    const hashString = cacheHashes
      .filter((cacheHash) => cacheHash)
      .sort()
      .join('&');

    return hashString ? md5(hashString) : undefined;
  },
  getCache() {
    return this.cache;
  },
  addCacheItem(hash, image) {
    this.cache[hash] = image;
  },
  removeCacheItem(hash) {
    delete this.cache[hash];
  },
  getCacheItem(hash) {
    return this.cache[hash];
  },
  isItemCached(hash) {
    return !!this.cache[hash];
  },
  markAsCached(hash) {
    this.cache[hash].isFromCache = true;
  },
  addCacheIndexItem(spriteName, hash) {
    this.cacheIndex[spriteName] = hash;
  },
  getCacheIndexItem(spriteName) {
    return this.cacheIndex[spriteName];
  },
  destroyCache() {
    this.cache = {};
  },
};

module.exports.cache = cache;
