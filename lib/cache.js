const fs = require('fs');
const md5 = require('md5');
/**
 * Custom module to cache sprite images so unchanged sprites don't need to be
 * processed by Spritesmith.
 */
const cache = {
  cache: {},
  cacheIndex: {},

  createCacheHash(imagePaths) {
    const cacheHashes = imagePaths.map((imagePath) => {
      return `${imagePath}=${md5(fs.readFileSync(imagePath).toString())}`;
    });

    return md5(cacheHashes.sort().join('&'));
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

exports.cache = cache;
