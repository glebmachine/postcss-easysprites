const fancyLog = require('fancy-log');

/**
 * Custom log function to style status messages.
 *
 * @param {object} message - A message to print to the console with formatting.
 *
 */
function log(...message) {
  fancyLog.apply(false, message);
}

exports.log = log;
