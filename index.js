const ansi = require('ansi-colors');
const async = require('async');
const fancyLog = require('fancy-log');
const fs = require('fs');
const lodash = require('lodash');
const md5 = require('md5');
const mkdirp = require('mkdirp');
const path = require('path');
const postcss = require('postcss');
const Q = require('q');
const spritesmith = require('spritesmith').run;
const url = require('url');
const {
  getBackgroundSize,
  getBackgroundImageUrl,
  getBackgroundPosition,
  getBackgroundColor,
} = require('./lib/get-background-values');

// Cache objects;
const cache = {};
const cacheIndex = {};

/**
 * Custom log function to style status messages.
 */
function log() {
  const data = Array.prototype.slice.call(arguments);
  fancyLog.apply(false, data);
}

/**
 * Constants.
 *
 * @type {String}
 */
const GROUP_DELIMITER = '.';
const GROUP_MASK = '*';
const BACKGROUND = 'background';
const BACKGROUND_IMAGE = 'background-image';

/**
 * postcss-easysprites module.
 * @module postcss-easysprites
 * @param {processOptions} [opts] Options passed to the plugin.
 */
module.exports = postcss.plugin('postcss-easysprites', (opts) => {
  // Options.
  opts = opts || {};
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
        .spread((images, opts) => {
          return setTokens(images, opts, css);
        })

        // compilation part
        .spread(runSpriteSmith)
        .spread(saveSprites)
        .spread(mapSpritesProperties)
        .spread((images, opts, sprites) => {
          return updateReferences(images, opts, sprites, css);
        })
    );
  };
});

/**
 * TODO: Collect images...
 *
 * @param {object} css - Object with CSS results.
 * @param {object} [opts] - Options passed to the plugin.
 * @returns {Array}
 */
function collectImages(css, opts) {
  const images = [];
  const stylesheetPath =
    opts.stylesheetPath || path.dirname(css.source.input.file);

  if (!stylesheetPath) {
    throw new Error(
      'Stylesheets path is undefined, please use option stylesheetPath!'
    );
  }

  css.walkRules((rule) => {
    const image = {
      path: null,
      url: null,
      stylesheetPath,
      ratio: 1,
      groups: [],
      token: '',
    };

    if (hasImageInRule(rule.toString())) {
      image.url = getImageUrl(rule.toString());
      const imageUrl = url.parse(image.url);

      // only locals, hashed paths
      if (
        imageUrl.host ||
        !imageUrl.hash ||
        imageUrl.pathname.indexOf('//') === 0 ||
        imageUrl.pathname.indexOf(';base64') !== -1
      ) {
        return;
      }

      image.hash = imageUrl.hash.replace('#', '');
      image.groups = [image.hash];

      // Perform search for retina
      if (isRetinaImage(image.url)) {
        image.ratio = getRetinaRatio(image.url);
      }

      // Get the path to the image.
      image.path = resolveUrl(image, opts);

      // file exists
      if (!fs.existsSync(image.path)) {
        log(
          'Easysprites:',
          ansi.red(image.path),
          'file unreachable or not exists'
        );

        // remove hash from link
        lodash.each(rule.nodes, (node) => {
          node.value = node.value.replace(`#${image.hash}`, '');
        });

        return rule;
      }

      images.push(image);
    }
  });

  return lodash.uniqWith(images, lodash.isEqual);
}

/**
 * TODO: Group by.
 *
 * @param {Array} images - Array of image objects.
 * @param {object} opts - Options passed to the plugin.
 * @returns {Promise}
 */
function applyGroupBy(images, opts) {
  return Q.Promise((resolve, reject) => {
    async.reduce(
      opts.groupBy,
      images,
      (images, group, next) => {
        async.map(
          images,
          (image, done) => {
            new Q(group(image))
              .then((group) => {
                if (group) {
                  image.groups.push(group);
                }

                done(null, image);
              })
              .catch(done);
          },
          next
        );
      },
      (err, images) => {
        if (err) {
          return reject(err);
        }

        resolve([images, opts]);
      }
    );
  });
}

/**
 * TODO: Set tokens.
 *
 * @param {Array} images - Array of image objects.
 * @param {object} opts - Options passed to the plugin.
 * @param {object} css - Object with CSS results.
 * @returns {Promise}
 */
function setTokens(images, opts, css) {
  return Q.Promise((resolve) => {
    css.walkDecls(/^background(-image)?$/, (decl) => {
      const rule = decl.parent;
      let url;
      let image;
      let color;

      // Manipulate only rules with background image
      // in them.
      if (hasImageInRule(rule.toString())) {
        url = getImageUrl(rule.toString());
        image = lodash.find(images, { url });

        if (image) {
          // We remove these declarations since
          // our plugin will insert them when
          // they are necessary.
          rule.walkDecls(/^background-(repeat|size|position)$/, (decl) => {
            decl.remove();
          });

          if (decl.prop === BACKGROUND) {
            color = getBackgroundColor(decl);

            // Extract color to background-color propery
            if (color && color.length === 1) {
              rule.prop = 'background-color';
              rule.value = color[0];
              rule.before = ' ';
            }
          }

          if (decl.prop === BACKGROUND || decl.prop === BACKGROUND_IMAGE) {
            image.token = postcss.comment({
              text: image.url,
              raws: {
                before: ' ',
                left: '@replace|',
                right: '',
              },
            });

            // Replace the declaration with a comment token
            // which will be used later for reference.
            decl.replaceWith(image.token);
          }
        }
      }
    });

    resolve([images, opts]);
  });
}

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
      .map((images, temp) => {
        const config = lodash.merge({}, opts, {
          src: lodash.map(images, 'path'),
        });
        let ratio;

        // Enlarge padding for retina images
        if (areAllRetina(images)) {
          ratio = lodash
            .chain(images)
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

          // Append info about sprite group
          result.groups = temp.map(mask(false));

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
 * Save the sprite image.
 *
 * @param {Array} images - An array of image objects.
 * @param {object} opts - Options passed to the plugin.
 * @param {Array} sprites - Array of sprite file object data.
 * @returns {Promise}
 */
function saveSprites(images, opts, sprites) {
  return Q.Promise((resolve, reject) => {
    if (!fs.existsSync(opts.spritePath)) {
      mkdirp.sync(opts.spritePath);
    }

    const all = lodash
      .chain(sprites)
      .map((sprite) => {
        sprite.path = makeSpritePath(opts, sprite.groups);

        // if this file is up to date
        if (sprite.isFromCache) {
          const deferred = Q.defer();
          log('Easysprites:', ansi.green(sprite.path), 'unchanged.');
          deferred.resolve(sprite);
          return deferred.promise;
        }

        // save new file version
        return Q.nfcall(
          fs.writeFile,
          sprite.path,
          Buffer.from(sprite.image, 'binary')
        ).then(() => {
          log('Easysprites:', ansi.yellow(sprite.path), 'generated.');
          return sprite;
        });
      })
      .value();

    Q.all(all)
      .then((sprites) => {
        resolve([images, opts, sprites]);
      })
      .catch((err) => {
        if (err) {
          reject(err);
        }
      });
  });
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
  return Q.Promise((resolve) => {
    sprites = lodash.map(sprites, (sprite) => {
      return lodash.map(sprite.coordinates, (coordinates, imagePath) => {
        return lodash.merge(lodash.find(images, { path: imagePath }), {
          coordinates,
          spritePath: sprite.path,
          properties: sprite.properties,
        });
      });
    });

    resolve([images, opts, sprites]);
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
 * TODO: Make sprite path.
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
 * TODO: Toggle...
 *
 * @param {boolean} toggle - Whether to toggle something.
 * @returns {Function}
 */
function mask(toggle) {
  const input = new RegExp(`[${toggle ? GROUP_DELIMITER : GROUP_MASK}]`, 'gi');
  const output = toggle ? GROUP_MASK : GROUP_DELIMITER;

  return (value) => {
    return value.replace(input, output);
  };
}

/**
 * TODO: Resolve URL...
 *
 * @param {object} image - Object of image properties.
 * @param {object} opts - Options passed to the plugin.
 * @returns {string}
 */
function resolveUrl(image, opts) {
  let results;

  if (/^\//.test(image.url)) {
    results = path.resolve(opts.imagePath, image.url.replace(/^\//, ''));
  } else {
    results = path.resolve(image.stylesheetPath, image.url);
  }

  // get rid of get params and hash;
  return results.split('#')[0].split('?')[0];
}

/**
 * Check for url in the given rule.
 *
 * @param {string} rule - The CSS declared rule.
 * @returns {boolean}
 */
function hasImageInRule(rule) {
  return /background[^:]*.*url[^;]+/gi.test(rule);
}

/**
 * Extract the path to image from the URL in given rule.
 *
 * @param {string} rule - The CSS declared rule.
 * @returns {string}
 */
function getImageUrl(rule) {
  const match = /background[^:]*:.*url\(([\S]+)\)/gi.exec(rule);

  return match ? match[1].replace(/['"]/gi, '') : '';
}

/**
 * Check whether the comment is a token that should be
 * replaced with CSS declarations.
 *
 * @param {object} comment - The comment to check.
 * @returns {boolean} `true` if the token is a comment token.
 */
function isToken(comment) {
  return /@replace/gi.test(comment.toString());
}

/**
 * Check whether the image is retina.
 *
 * @param {string} imageUrl - The image URL string.
 * @returns {boolean} Whether the image is retina.
 */
function isRetinaImage(imageUrl) {
  return /@(\d)x\.[a-z]{3,4}$/gi.test(imageUrl.split('#')[0]);
}

/**
 * Return the retina ratio number of a image URL string.
 *
 * @param {string} imageUrl - The image URL string.
 * @returns {number} The retina ratio.
 */
function getRetinaRatio(imageUrl) {
  // Find any @{number}x matches in the url string.
  const matches = /@(\d)x\.[a-z]{3,4}$/gi.exec(imageUrl.split('#')[0]);
  const ratio = parseInt(matches[1], 10);

  return ratio;
}

/**
 * Check whether all images are retina.
 *
 * @param {Array} images - The images to check.
 * @returns {boolean} Whether the images are all retina.
 */
function areAllRetina(images) {
  return lodash.every(images, (image) => {
    return image.ratio > 1;
  });
}
