const ansi = require('ansi-colors');
const fs = require('fs');
const lodash = require('lodash');
const path = require('path');
const url = require('url');
const { log } = require('./log');
const { isRetinaImage, getRetinaRatio } = require('./retina-images');
const {
  hasImageInRule,
  getImageUrl,
  resolveImageUrl,
} = require('./image-urls');

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
      image.path = resolveImageUrl(image, opts);
      // file exists
      if (!fs.existsSync(image.path)) {
        log(
          'Easysprites:',
          ansi.red(image.path),
          'file unreachable or not exists'
        );
        // Remove hash from link.
        lodash.each(rule.nodes, (node) => {
          const ruleNode = node;
          ruleNode.value = ruleNode.value.replace(`#${image.hash}`, '');
        });
        return;
      }
      images.push(image);
    }
  });
  return lodash.uniqWith(images, lodash.isEqual);
}

exports.collectImages = collectImages;
