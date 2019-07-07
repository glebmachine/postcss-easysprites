const fs = require('fs');
const md5 = require('md5');
/**
 * Custom module to cache sprite images so don't need to be processed by
 * Spritesmith if they haven't changed.
 */
const cache = {
  cache: {},
  cacheIndex: {},

  createCacheHash(imagePaths) {
    const cacheHashes = [];

    imagePaths.forEach((imagePath) => {
      cacheHashes.push(
        `${imagePath}=${md5(fs.readFileSync(imagePath).toString())}`
      );
    });

    return md5(cacheHashes.join('&'));
  },
  getCache() {
    return this.cache;
  },
  // addItemToCache
  // addToCache
  // addCachedItem
  addCacheItem(hash, image) {
    this.cache[hash] = image;
  },
  // removeItemFromCache
  // removeFromCache
  // removeCachedItem
  removeCacheItem(hash) {
    delete this.cache[hash];
  },
  // getItemFromCache
  // getFromCache
  // getCachedItem
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
  // removeCacheIndexItem(spriteName) {
  //   delete this.cacheIndex[spriteName];
  // },
  getCacheIndexItem(spriteName) {
    return this.cacheIndex[spriteName];
  },
  // getCacheIndex() {
  //   return this.cacheIndex;
  // },
  destroyCache() {
    this.cache = {};
  },
};

exports.cache = cache;
