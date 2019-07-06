const path = require('path');
const { isValidLayout } = require('./layouts');
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

    this.opts.groupBy = customOptions.groupBy || [];

    this.opts.groupBy.unshift((image) => {
      // If the image is retina, add the @2x, @3x, etc. to the grouping array.
      if (image.ratio > 1) {
        return `@${image.ratio}x`;
      }

      return null;
    });

    // If custom options have not been defined by the user, add reasonable
    // default ones.
    this.opts.padding = customOptions.padding || DEFAULT_PADDING;
    this.opts.algorithm =
      customOptions.algorithm !== undefined &&
      isValidLayout(customOptions.algorithm)
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

    return this.opts;
  },

  /**
   * Fetches all defined plugin options.
   *
   * @returns {object}
   */
  getAllOptions() {
    return this.opts;
  },
};

exports.pluginOptions = pluginOptions;
