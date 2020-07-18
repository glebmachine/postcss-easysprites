/**
 * @file Updates CSS background property references.
 * @module update-references
 */

const path = require('path');
const { decl } = require('postcss');

const { pluginOptions } = require('./plugin-options');
const { isToken } = require('./tokens');
const {
  getBackgroundSize,
  getBackgroundImageUrl,
  getBackgroundPosition,
} = require('./background-values');

/**
 * Builds the 'background-size' CSS declaration node.
 *
 * @param {object} image - The image to set the background size information for.
 * @returns {object}
 */
function buildBackgroundSizeDecl(image) {
  return decl({
    prop: 'background-size',
    value: getBackgroundSize({
      width: image.properties.width,
      height: image.properties.height,
      ratio: image.ratio,
    }),
  });
}

/**
 * Builds the 'background-color' CSS declaration node.
 *
 * @param {string} color - The color to set the background color property to.
 * @returns {object}
 */
function buildBackgroundColorDecl(color) {
  return decl({
    prop: 'background-color',
    value: color,
  });
}

/**
 * Builds the 'background-image' CSS declaration node.
 *
 * @param {string} image - The image to set the background image CSS for.
 * @returns {object}
 */
function buildBackgroundImageDecl(image) {
  return decl({
    prop: 'background-image',
    value: getBackgroundImageUrl(image.spriteRef),
  });
}

/**
 * Builds the 'background-position' CSS declaration node.
 *
 * @param {string} image - The image to set the background position for.
 * @returns {object}
 */
function buildBackgroundPositionDecl(image) {
  return decl({
    prop: 'background-position',
    value: getBackgroundPosition({
      x: image.coordinates.x,
      y: image.coordinates.y,
      ratio: image.ratio,
    }),
  });
}

/**
 * Builds the width or height CSS declaration node.
 *
 * @param {string} dimension - Which dimension (width or height) to build.
 * @param {string} image - The image to set the width/height CSS for.
 * @returns {object}
 */
function buildDimensionDecl(dimension, image) {
  return decl({
    prop: dimension,
    value: `${
      image.ratio > 1
        ? image.coordinates[dimension] / image.ratio
        : image.coordinates[dimension]
    }px`,
  });
}

/**
 * Update background related values with new sprite values.
 *
 * @param {Array} images - An array of image objects.
 * @param {Array} sprites - Array of sprite file object data.
 * @param {object} css - With CSS results.
 * @returns {Array}
 */
function updateReferences(images, sprites, css) {
  const opts = pluginOptions.getOptions();

  css.walkComments((comment) => {
    // Manipulate only token comments.
    if (!isToken(comment)) return;

    const rule = comment.parent;
    const image = images.find((element) => element.url === comment.text);

    if (!image) return;

    // Generate the correct reference to the sprite.
    image.spriteRef = path
      .relative(
        opts.outputStylesheetPath || image.stylesheetPath,
        image.spritePath
      )
      .split(path.sep)
      .join('/');

    const backgroundImage = buildBackgroundImageDecl(image);
    const backgroundPosition = buildBackgroundPositionDecl(image);

    // Replace the comment and append necessary properties.
    comment.replaceWith(backgroundImage);

    // Output the dimensions.
    if (opts.outputDimensions) {
      ['height', 'width'].forEach((dimension) => {
        rule.insertAfter(backgroundImage, buildDimensionDecl(dimension, image));
      });
    }

    rule.insertAfter(backgroundImage, backgroundPosition);

    // If the image is retina, we need to set the correct background size to
    // compensate for the additional PPI.
    if (image.ratio > 1) {
      const backgroundSize = buildBackgroundSizeDecl(image);
      rule.insertAfter(backgroundPosition, backgroundSize);
    }

    if (rule.prop === 'background-color') {
      const backgroundColor = buildBackgroundColorDecl(rule.value);
      rule.insertBefore(backgroundImage, backgroundColor);
    }
  });

  return [images, sprites, css];
}

module.exports.updateReferences = updateReferences;
