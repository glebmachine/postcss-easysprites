const lodash = require('lodash');
const path = require('path');
const postcss = require('postcss');
const Q = require('q');

const { isToken } = require('./tokens');
const {
  getBackgroundSize,
  getBackgroundImageUrl,
  getBackgroundPosition,
} = require('./get-background-values');

/**
 * Update background related values with new sprite values.
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
      let backgroundColor;

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

          if (rule.prop === 'background-color') {
            backgroundColor = postcss.decl({
              prop: 'background-color',
              value: rule.value,
            });
            rule.insertBefore(backgroundImage, backgroundColor);
          }
        }
      }
    });

    resolve([images, opts, sprites, css]);
  });
}

exports.updateReferences = updateReferences;
