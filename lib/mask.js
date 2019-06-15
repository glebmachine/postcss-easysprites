const { GROUP_DELIMITER, GROUP_MASK } = require('./constants');

/**
 * TODO: Toggle...
 *
 * @param {boolean} toggle - Whether to toggle something.
 * @returns {Function}
 */
function mask(toggle) {
  const input = new RegExp(`[${toggle ? GROUP_DELIMITER : GROUP_MASK}]`, 'gi');
  const output = toggle ? GROUP_MASK : GROUP_DELIMITER;
  return (value) => {
    return value.replace(input, output);
  };
}

exports.mask = mask;
