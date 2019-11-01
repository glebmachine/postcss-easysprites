const fancyLog = require('fancy-log');

/**
 * Custom console log function to output styled status messages.
 *
 * @param {object} message - A formatted message to print to the console.
 *
 */
function log(...message) {
  fancyLog.apply(false, message);
}

module.exports.log = log;
