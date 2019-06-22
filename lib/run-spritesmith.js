const fs = require('fs');
const lodash = require('lodash');
const md5 = require('md5');
const Q = require('q');
const spritesmith = require('spritesmith').run;

const { areAllRetina } = require('./retina-images');
const { mask } = require('./mask');

const GROUP_DELIMITER = require('./constants');

// Cache objects;
const cache = {};
const cacheIndex = {};

/**
 * Run SpriteSmith on the array of images.
 *
 * @param {Array} images - Array of image objects.
 * @param {object} opts - Options passed to the plugin.
 * @returns {Promise}
 */
function runSpriteSmith(images, opts) {
  return Q.Promise((resolve, reject) => {
    const all = lodash
      .chain(images)
      .groupBy((image) => {
        const temp = image.groups.map(mask(true));
        temp.unshift('_');
        return temp.join(GROUP_DELIMITER);
      })
      .map((imagesToSprite, tempImage) => {
        let temp = tempImage;
        const config = lodash.merge({}, opts, {
          src: lodash.map(images, 'path'),
        });

        let ratio;

        // Enlarge padding for retina images
        if (areAllRetina(imagesToSprite)) {
          ratio = lodash
            .chain(imagesToSprite)
            .flatMap('ratio')
            .uniq()
            .value();

          if (ratio.length === 1) {
            config.padding *= ratio[0];
          }
        }

        let checkstring = [];
        // collect images datechanged
        config.spriteName = temp.replace(/^_./, '').replace(/.@/, '@');
        lodash.each(config.src, (image) => {
          checkstring.push(
            `${image}=${md5(fs.readFileSync(image).toString())}`
          );
        });

        checkstring = md5(checkstring.join('&'));

        // get data from cache (avoid spritesmith)
        if (cache[checkstring]) {
          const deferred = Q.defer();
          const results = cache[checkstring];
          results.isFromCache = true;
          deferred.resolve(results);
          return deferred.promise;
        }

        return Q.nfcall(spritesmith, config).then((result) => {
          temp = temp.split(GROUP_DELIMITER);
          temp.shift();
          const spriteResult = result;

          // Append info about sprite group.
          spriteResult.groups = temp.map(mask(false));

          // Cache - clean old
          const oldCheckstring = cacheIndex[config.spriteName];

          if (oldCheckstring && cache[oldCheckstring]) {
            delete cache[oldCheckstring];
          }

          // Cache - add brand new data
          cacheIndex[config.spriteName] = checkstring;
          cache[checkstring] = result;

          return result;
        });
      })
      .value();

    Q.all(all)
      .then((results) => {
        resolve([images, opts, results]);
      })
      .catch((err) => {
        if (err) {
          reject(err);
        }
      });
  });
}

exports.runSpriteSmith = runSpriteSmith;
