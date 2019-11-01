const fs = require('fs');
const { promisify } = require('util');
const ansi = require('ansi-colors');
const url = require('url');

const fsAccessAsync = promisify(fs.access);
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
 * @async
 * @param {string} path - The path of the file to check.
 * @returns {boolean}
 */
async function fileExistsAsync(path) {
  try {
    await fsAccessAsync(path);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Checks if a image actually exists.
 *
 * @async
 * @param {object} image - Object of image properties.
 * @param {Array} rules - The css rule nodes.
 * @returns {Promise}
 */
async function imageExists(image, rules) {
  const exists = await fileExistsAsync(image.path);

  if (exists) {
    return image;
  }

  log(
    'Easysprites:',
    ansi.red(image.path),
    'file unreachable or does not exists'
  );

  // If the image file doesn't exist, clean up the background image URL's
  // by removing hash suffix.
  rules.forEach((node) => {
    const nodeRule = node;
    nodeRule.value = node.value.replace(`#${image.hash}`, '');
  });

  return undefined;
}

/**
 * Collect all background images into an array.
 *
 * @async
 * @param {object} css - Object with CSS results.
 * @returns {Array}
 */
async function collectImages(css) {
  const images = [];

  // Loop through all CSS rules.
  css.walkRules((rule) => {
    // Get the string representation of the PostCSS rule object.
    const cssRule = rule.toString();

    // Check if there is a `background(-image)` rule with a url() defined.
    if (!hasImageInRule(cssRule)) return;

    const image = buildImageData(cssRule);
    if (!image) return;

    images.push(imageExists(image, rule.nodes));
  });

  const allFoundImages = await Promise.all(images).then((array) =>
    array.filter((image) => !!image)
  );

  // Return an array with all duplicates removed.
  return [
    ...new Map(
      allFoundImages.map((obj) => [JSON.stringify(obj), obj])
    ).values(),
  ];
}

module.exports.collectImages = collectImages;
module.exports.imageExists = imageExists;
