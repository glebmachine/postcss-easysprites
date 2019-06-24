const Q = require('q');
const postcss = require('postcss');

const { getBackgroundColor } = require('./get-background-values');
const { hasImageInRule, getImageUrl } = require('./image-urls');
const { BACKGROUND, BACKGROUND_IMAGE } = require('./constants');

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
 * Sets comment tokens so they can be used later for updating references.
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
        image = images.find((img) => {
          return img.url === url;
        });

        if (image) {
          // We remove these declarations since our plugin will insert them
          // when they are necessary.
          rule.walkDecls(
            /^background-(repeat|size|position)$/,
            (backgroundDecl) => {
              backgroundDecl.remove();
            }
          );

          if (decl.prop === BACKGROUND) {
            color = getBackgroundColor(decl.value);

            // Extract the color for the background-color property.
            if (color) {
              rule.prop = 'background-color';
              rule.value = color;
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

exports.isToken = isToken;
exports.setTokens = setTokens;
