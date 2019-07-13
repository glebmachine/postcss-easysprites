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

const fsAccessAsync = promisify(fs.access);

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

const fileExistsAsync = async (path) => {
  const fileExists = await fsAccessAsync(path)
    .then(() => true)
    .catch(() => false);

  return fileExists;
};

/**
 * Collect all background images into an array.
 *
 * @param {object} css - Object with CSS results.
 * @returns {Array}
 */
function collectImages(css) {
  const images = [];
  let fetchedFiles;

  return new Promise((resolve) => {
    // Loop through all CSS rules.
    css.walkRules((rule) => {
      // Get the string representation of the PostCSS rule object.
      const cssRule = rule.toString();

      // Check if there is a `background(-image)` rule with a url() defined.
      if (!hasImageInRule(cssRule)) return;

      const image = buildImageData(cssRule);
      if (!image) return;

      fetchedFiles = fileExistsAsync(image.path)
        .then((result) => {
          if (result) {
            images.push(image);
          } else {
            log(
              'Easysprites:',
              ansi.red(image.path),
              'file unreachable or does not exists'
            );

            // If the file doesn't exist, clean up the background image URL's
            // by removing hash suffix.
            rule.nodes.forEach((node) => {
              const nodeRule = node;
              nodeRule.value = node.value.replace(`#${image.hash}`, '');
            });
          }
        })
        .catch((err) => console.err(err));
    });

    return fetchedFiles
      ? fetchedFiles.then(() =>
          resolve(lodash.uniqWith(images, lodash.isEqual))
        )
      : resolve(lodash.uniqWith(images, lodash.isEqual));

    // if (fetchedFiles) {
    //   fetchedFiles.then(() => {
    //     // Filter out any non-unique image objects.
    //     // TODO: Investigate importing only the lodash methods that are
    //     // actually used.
    //     resolve(lodash.uniqWith(images, lodash.isEqual));
    //   });
    // } else {
    //   resolve(lodash.uniqWith(images, lodash.isEqual));
    // }
  });
}

exports.collectImages = collectImages;
