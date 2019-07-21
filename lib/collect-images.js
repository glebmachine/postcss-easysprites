const fs = require('fs');
const { promisify } = require('util');
const ansi = require('ansi-colors');
const lodash = require('lodash');
const url = require('url');
const { log } = require('./log');
const { isRetinaImage, getRetinaRatio } = require('./retina-images');
const { pluginOptions } = require('./plugin-options');

const {
  isLocalUrl,
  hasImageInRule,
  getImageUrl,
  resolveImageUrl,
} = require('./image-urls');

/**
 * Adds the required image data needed to include it in the sprite.
 *
 * @param {object} cssRule - String representation of the PostCSS rule object.
 * @returns {object|null}
 */
function buildImageData(cssRule) {
  const opts = pluginOptions.getOptions();

  // Create a object to hold our image data.
  const image = {
    path: null,
    url: null,
    stylesheetPath: opts.stylesheetPath,
    ratio: 1,
    groups: [],
    token: '',
  };

  // Extract the url() parameter information.
  image.url = getImageUrl(cssRule);

  // Parse the URL information into a Node URL data object so individual
  // data elements can be accessed.
  const imageUrl = url.parse(image.url);

  // Check that the URL is to a local file.
  if (isLocalUrl(imageUrl)) {
    image.hash = imageUrl.hash.replace('#', '');
    image.groups = [image.hash];

    // Check if the image is retina. If it is, store the ratio.
    image.ratio = isRetinaImage(image.url)
      ? getRetinaRatio(image.url)
      : image.ratio;

    // Get the path to the image.
    image.path = resolveImageUrl(image);

    return image;
  }

  return null;
}

/**
 * Asynchronously checks if the file at the path actually exists.
 *
 * @param {string} path - The path of the file to check.
 * @returns {boolean}
 */
async function fileExistsAsync(path) {
  const fsAccessAsync = promisify(fs.access);

  const fileExists = await fsAccessAsync(path)
    .then(() => true)
    .catch(() => false);

  return fileExists;
}

/**
 * Checks if a image actually exists.
 *
 * @param {object} image - Object of image properties.
 * @param {Array} ruleNodes - The css rule nodes.
 * @param {Array} images - The array of images that exist.
 * @returns {Promise}
 */
function imageExists(image, ruleNodes, images) {
  return fileExistsAsync(image.path)
    .then((result) => {
      if (result) {
        images.push(image);
      } else {
        log(
          'Easysprites:',
          ansi.red(image.path),
          'file unreachable or does not exists'
        );

        // If the image file doesn't exist, clean up the background image URL's
        // by removing hash suffix.
        ruleNodes.forEach((node) => {
          const nodeRule = node;
          nodeRule.value = node.value.replace(`#${image.hash}`, '');
        });
      }
    })
    .catch((error) => {
      throw new Error(error);
    });
}

/**
 * Collect all background images into an array.
 *
 * @param {object} css - Object with CSS results.
 * @returns {Array}
 */
function collectImages(css) {
  const images = [];
  let allImagesChecked;

  return new Promise((resolve) => {
    // Loop through all CSS rules.
    css.walkRules((rule) => {
      // Get the string representation of the PostCSS rule object.
      const cssRule = rule.toString();

      // Check if there is a `background(-image)` rule with a url() defined.
      if (!hasImageInRule(cssRule)) return;

      const image = buildImageData(cssRule);
      if (!image) return;

      allImagesChecked = imageExists(image, rule.nodes, images);
    });

    return allImagesChecked
      ? allImagesChecked.then(() => {
          resolve(lodash.uniqWith(images, lodash.isEqual));
        })
      : resolve(images);
  });
}

exports.collectImages = collectImages;
exports.imageExists = imageExists;
