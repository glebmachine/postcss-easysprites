const { expect } = require('chai');
const { cache } = require('../lib/cache');

/* eslint-disable func-names */
describe('Caching', function() {
  it('should clear cache object when `destroy()` is called', function(done) {
    const imagePaths = [
      './test/fixtures/images/arrow-next.png',
      './test/fixtures/images/arrow-next--hover.png',
    ];
    const spritesheet = 'arrow-next';
    const cacheHash = cache.createCacheHash(imagePaths);

    cache.addCacheItem(cacheHash, spritesheet);
    expect(cache.isItemCached(cacheHash)).to.equal(true);

    cache.destroyCache();

    expect(cache.isItemCached(cacheHash)).to.equal(false);
    // eslint-disable-next-line
    expect(cache.getCache()).to.be.an('object').that.is.empty;

    done();
  });
});
