const { GROUP_DELIMITER, GROUP_MASK } = require('./constants');

/**
 * Replaces the input with the output.
 *
 * @param {boolean} toggle - Switches between GROUP_DELIMITER and GROUP_MASK.
 * @returns {Function}
 */
function mask(toggle) {
  const input = new RegExp(`[${toggle ? GROUP_DELIMITER : GROUP_MASK}]`, 'gi');
  const output = toggle ? GROUP_MASK : GROUP_DELIMITER;

  return (value) => value.replace(input, output);
}

module.exports.mask = mask;
