const fs = require('fs');
const lodash = require('lodash');
const md5 = require('md5');
const path = require('path');
const postcss = require('postcss');
const Q = require('q');
const spritesmith = require('spritesmith').run;

const { applyGroupBy } = require('./lib/apply-group-by');
const { collectImages } = require('./lib/collect-images');
const { isToken, setTokens } = require('./lib/tokens');
const {
  getBackgroundSize,
  getBackgroundImageUrl,
  getBackgroundPosition,
} = require('./lib/get-background-values');

const { areAllRetina } = require('./lib/retina-images');
const { mapSpritesProperties, saveSprites } = require('./lib/sprites');
const { mask } = require('./lib/mask');

const GROUP_DELIMITER = require('./lib/constants');

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

/**
 * TODO: Update references...
 *
 * @param {Array} images - An array of image objects.
 * @param {object} opts - Options passed to the plugin.
 * @param {Array} sprites - Array of sprite file object data.
 * @param {object} css - With CSS results.
 * @returns {Promise}
 */
function updateReferences(images, opts, sprites, css) {
  return Q.Promise((resolve) => {
    css.walkComments((comment) => {
      let rule;
      let image;
      let backgroundImage;
      let backgroundPosition;
      let backgroundSize;

      // Manipulate only token comments.
      if (isToken(comment)) {
        rule = comment.parent;
        image = lodash.find(images, { url: comment.text });

        if (image) {
          // Generate correct ref to the sprite.
          image.spriteRef = path.relative(
            image.stylesheetPath,
            image.spritePath
          );
          image.spriteRef = image.spriteRef.split(path.sep).join('/');

          backgroundImage = postcss.decl({
            prop: 'background-image',
            value: getBackgroundImageUrl(image.spriteRef),
          });

          backgroundPosition = postcss.decl({
            prop: 'background-position',
            value: getBackgroundPosition({
              x: image.coordinates.x,
              y: image.coordinates.y,
              ratio: image.ratio,
            }),
          });

          // Replace the comment and append necessary properties.
          comment.replaceWith(backgroundImage);

          // Output the dimensions.
          if (opts.outputDimensions) {
            ['height', 'width'].forEach((prop) => {
              rule.insertAfter(
                backgroundImage,
                postcss.decl({
                  prop,
                  value: `${
                    image.ratio > 1
                      ? image.coordinates[prop] / image.ratio
                      : image.coordinates[prop]
                  }px`,
                })
              );
            });
          }

          rule.insertAfter(backgroundImage, backgroundPosition);

          if (image.ratio > 1) {
            backgroundSize = postcss.decl({
              prop: 'background-size',
              value: getBackgroundSize({
                width: image.properties.width,
                height: image.properties.height,
                ratio: image.ratio,
              }),
            });

            rule.insertAfter(backgroundPosition, backgroundSize);
          }
        }
      }
    });

    resolve([images, opts, sprites, css]);
  });
}

/**
 * postcss-easysprites module.
 * @module postcss-easysprites
 * @param {processOptions} [options] Options passed to the plugin.
 */
module.exports = postcss.plugin('postcss-easysprites', (options) => {
  // Options.
  const opts = options || {};
  opts.groupBy = opts.groupBy || [];
  opts.padding = opts.padding ? opts.padding : 20;

  // Paths.
  opts.imagePath = path.resolve(process.cwd(), opts.imagePath || '');
  opts.spritePath = path.resolve(process.cwd(), opts.spritePath || '');

  // Group retina images.
  opts.groupBy.unshift((image) => {
    if (image.ratio > 1) {
      return `@${image.ratio}x`;
    }

    return null;
  });

  return (css) => {
    // if file path
    return (
      Q

        // prepare part
        .all([collectImages(css, opts), opts])
        .spread(applyGroupBy)
        .spread((images, tokenOptions) => {
          return setTokens(images, tokenOptions, css);
        })

        // compilation part
        .spread(runSpriteSmith)
        .spread(saveSprites)
        .spread(mapSpritesProperties)
        .spread((images, spriteOptions, sprites) => {
          return updateReferences(images, spriteOptions, sprites, css);
        })
    );
  };
});
