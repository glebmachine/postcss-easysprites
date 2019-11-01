const postcss = require('postcss');

const { getBackgroundColor } = require('./background-values');
const { hasImageInRule, getImageUrl } = require('./image-urls');
const { BACKGROUND, BACKGROUND_COLOR } = require('./constants');

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
 * Remove background related properties that will need to be refined for sprite.
 *
 * We remove these declarations since our plugin will insert them when
 * they are necessary.
 *
 * @param {object} rule - The AST CSS rule object.
 * @returns {undefined}
 */
function removeRedefinedDecl(rule) {
  rule.walkDecls(/^background-(repeat|size|position)$/, (backgroundDecl) => {
    backgroundDecl.remove();
  });
}

/**
 * Sets a new 'background-color' property.
 *
 * @param {object} rule - The 'background' property rule.
 * @param {string} color - The image extracted from the rule.
 * @returns {undefined}
 */
function setBackgroundColorProp(rule, color) {
  const ruleObject = rule;
  ruleObject.prop = BACKGROUND_COLOR;
  ruleObject.value = color;
  ruleObject.before = ' ';
}

/**
 * Sets the image url as a comment so it can be extracted later.
 *
 * @param {object} image - The image object containing.
 * @returns {undefined}.
 */
function setCommentToken(image) {
  const imageObj = image;
  imageObj.token = postcss.comment({
    text: imageObj.url,
    raws: {
      before: ' ',
      left: '@replace|',
      right: '',
    },
  });
}

/**
 * Sets comment tokens so they can be used later for updating references.
 *
 * @param {Array} images - Array of image objects.
 * @param {object} css - Object with CSS results.
 * @returns {Array}
 */
function setTokens(images, css) {
  css.walkDecls(/^background(-image)?$/, (decl) => {
    const rule = decl.parent;
    const ruleString = rule.toString();

    // Manipulate only rules with background images in them.
    if (!hasImageInRule(ruleString)) return;

    // Search the image array for an image with the same url.
    const image = images.find((img) => img.url === getImageUrl(ruleString));

    // Only continue if a matching image is found.
    if (!image) return;

    // Remove rules that will be redefined later.
    removeRedefinedDecl(rule);

    if (decl.prop === BACKGROUND) {
      const color = getBackgroundColor(decl.value);

      if (color) {
        // Extract the color for the background-color property.
        setBackgroundColorProp(rule, color);
      }
    }

    // Set the comment information as a token on the image.
    setCommentToken(image);

    // Replace the declaration with a comment token
    // which will be used later for reference.
    decl.replaceWith(image.token);
  });

  return [images];
}

module.exports.isToken = isToken;
module.exports.setTokens = setTokens;
