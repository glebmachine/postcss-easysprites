const path = require('path');
const postcss = require('postcss');

const { pluginOptions } = require('./plugin-options');
const { isToken } = require('./tokens');
const {
  getBackgroundSize,
  getBackgroundImageUrl,
  getBackgroundPosition,
} = require('./get-background-values');

/**
 * Builds the 'background-size' CSS declaration node.
 *
 * @param {object} image - The image to set the background size information for.
 * @returns {object}
 */
function buildBackgroundSizeDecl(image) {
  return postcss.decl({
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
  return postcss.decl({
    prop: 'background-color',
    value: color,
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
  const opts = pluginOptions.getAllOptions();

  return new Promise((resolve) => {
    css.walkComments((comment) => {
      // Manipulate only token comments.
      if (!isToken(comment)) return;

      const rule = comment.parent;
      const image = images.find((element) => element.url === comment.text);

      if (!image) return;

      // Generate correct ref to the sprite.
      image.spriteRef = path.relative(image.stylesheetPath, image.spritePath);
      image.spriteRef = image.spriteRef.split(path.sep).join('/');

      const backgroundImage = postcss.decl({
        prop: 'background-image',
        value: getBackgroundImageUrl(image.spriteRef),
      });

      const backgroundPosition = postcss.decl({
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

    resolve([images, opts, sprites, css]);
  });
}

exports.updateReferences = updateReferences;
