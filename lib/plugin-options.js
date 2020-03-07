const path = require('path');
const { isValidSpriteLayout } = require('./sprite-layouts');
const { DEFAULT_LAYOUT, DEFAULT_PADDING } = require('./constants');

/**
 * Sets up default plugin settings object.
 */
const pluginOptions = {
  opts: {},

  /**
   * Checks for user defined plugin options and adds default options for any
   * missing.
   *
   * @param {object} customOptions - Initial options passed to the plugins.
   * @param {string} cssFilePath - The path of the source CSS file.
   * @returns {object}
   */
  init(customOptions = {}, cssFilePath) {
    // Add and test that the stylesheet path can be set.
    this.opts.stylesheetPath =
      customOptions.stylesheetPath ||
      (cssFilePath ? path.dirname(cssFilePath) : null);

    if (!this.opts.stylesheetPath) {
      throw new Error(
        'Stylesheets path is undefined, please use option stylesheetPath!'
      );
    }

    // If custom options have not been defined by the user, add reasonable
    // default ones.
    this.opts.padding =
      customOptions.padding === undefined
        ? DEFAULT_PADDING
        : customOptions.padding;

    this.opts.algorithm =
      customOptions.algorithm && isValidSpriteLayout(customOptions.algorithm)
        ? customOptions.algorithm
        : DEFAULT_LAYOUT;

    this.opts.outputDimensions =
      customOptions.outputDimensions !== undefined
        ? customOptions.outputDimensions
        : false;

    this.opts.imagePath = path.resolve(
      process.cwd(),
      customOptions.imagePath || ''
    );

    this.opts.spritePath = path.resolve(
      process.cwd(),
      customOptions.spritePath || ''
    );

    this.opts.outputStylesheetPath = customOptions.outputStylesheetPath
      ? path.resolve(process.cwd(), customOptions.outputStylesheetPath)
      : undefined;

    return this.opts;
  },

  /**
   * Fetches all defined plugin options.
   *
   * @returns {object}
   */
  getOptions() {
    return this.opts;
  },
};

module.exports.pluginOptions = pluginOptions;
