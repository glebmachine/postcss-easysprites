const ansi = require('ansi-colors');
const { SPRITE_LAYOUTS } = require('./constants');

/**
 * Prints a warning message to the user that the layout specified is not
 * valid and that the default layout will be used instead.
 *
 * @param {string} layout - The layout that failed validation.
 * @returns {object}
 */
function warnInvalidLayout(layout) {
  return console.warn(
    ansi.red(
      `${layout} is not a valid sprite layout algorithm, the default 'binary-tree' will be used instead.`
    )
  );
}

/**
 * Check whether a layout specified is a valid spritesmith layout.
 *
 * @param {string} layout - The layout to check the validity of.
 * @returns {boolean|string}
 */
function isValidSpriteLayout(layout) {
  const isValidLayout = SPRITE_LAYOUTS.includes(layout);

  if (!isValidLayout) {
    warnInvalidLayout(layout);
  }

  return isValidLayout;
}

module.exports.isValidSpriteLayout = isValidSpriteLayout;
