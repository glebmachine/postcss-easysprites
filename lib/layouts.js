const { SPRITE_LAYOUTS } = require('./constants');

/**
 * Check whether a layout specified is a valid spritesmith layout.
 *
 * @param {string} layout - The layout to check the validity of.
 * @returns {boolean}
 */
function isLayout(layout) {
  const warning = `${layout} is not a valid sprite layout algorithm, the default 'binary-tree' will be used instead.`;

  return SPRITE_LAYOUTS.includes(layout) || console.warn(warning);
}

exports.isLayout = isLayout;
