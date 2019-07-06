const ansi = require('ansi-colors');
const fs = require('fs');
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
  const opts = pluginOptions.getAllOptions();

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
 * Collect all background images into an array.
 *
 * @param {object} css - Object with CSS results.
 * @returns {Array}
 */
function collectImages(css) {
  const images = [];

  // Loop through all CSS rules.
  css.walkRules((rule) => {
    // Get the string representation of the PostCSS rule object.
    const cssRule = rule.toString();

    // Check if there is a `background(-image)` rule with a url() defined.
    if (!hasImageInRule(cssRule)) return;

    const image = buildImageData(cssRule);
    if (!image) return;

    // Check that the file exists.
    // TODO: Investigate using async `fs.access` to check for file existence.
    if (!fs.existsSync(image.path)) {
      log(
        'Easysprites:',
        ansi.red(image.path),
        'file unreachable or does not exists'
      );

      // If the file doesn't exist, clean up the background image URL's by
      // removing hash suffix.
      rule.nodes.forEach((node) => {
        const nodeRule = node;
        nodeRule.value = node.value.replace(`#${image.hash}`, '');
      });

      return;
    }

    // If everything's valid, add the image object to the collection.
    images.push(image);
  });

  // Filter out any non-unique image objects.
  // TODO: Investigate importing only the lodash methods that are actually used.
  return lodash.uniqWith(images, lodash.isEqual);
}

exports.collectImages = collectImages;
