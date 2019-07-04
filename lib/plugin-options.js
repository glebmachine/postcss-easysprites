const path = require('path');
const { isLayout } = require('./layouts');
const { DEFAULT_LAYOUT, DEFAULT_PADDING } = require('./constants');

const pluginOptions = {
  opts: {},

  init(customOptions) {
    this.opts.groupBy = customOptions.groupBy || [];

    this.opts.groupBy.unshift((image) => {
      if (image.ratio > 1) {
        return `@${image.ratio}x`;
      }

      return null;
    });

    // If custom options have not been defined by the user, add reasonable
    // default ones.
    this.opts.padding = customOptions.padding || DEFAULT_PADDING;
    this.opts.algorithm =
      customOptions.algorithm !== undefined && isLayout(customOptions.algorithm)
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
  },
  get(prop) {
    return this.opts[prop];
  },
  getAll() {
    return this.opts;
  },
  set(prop, value) {
    this.opts[prop] = value;
  },
  setStylesheetPath(stylesheetPath, cssFilePath) {
    // Add and test that the stylesheet path can be set.
    this.opts.stylesheetPath =
      stylesheetPath || (cssFilePath ? path.dirname(cssFilePath) : null);

    if (!this.opts.stylesheetPath) {
      throw new Error(
        'Stylesheets path is undefined, please use option stylesheetPath!'
      );
    }
  },
};

/**
 * Sets up default plugin settings object.
 *
 * Checks for user defined plugin options and adds default options for any
 * missing.
 *
 * @param {object} options - Initial options passed to the plugins.
 * @param {string} cssFilePath - The path of the source CSS file.
 * @returns {object}
 */
function getDefaultOptions(options, cssFilePath) {
  const opts = options || {};

  // Add and test that the stylesheet path can be set.
  opts.stylesheetPath =
    opts.stylesheetPath || (cssFilePath ? path.dirname(cssFilePath) : null);

  if (!opts.stylesheetPath) {
    throw new Error(
      'Stylesheets path is undefined, please use option stylesheetPath!'
    );
  }

  // If custom options have not been defined by the user, add reasonable
  // default ones.
  opts.groupBy = opts.groupBy || [];
  opts.padding = opts.padding || DEFAULT_PADDING;
  opts.algorithm = opts.algorithm || DEFAULT_LAYOUT;

  // Check that the layout algorithm is valid.
  isLayout(opts.algorithm);

  // Paths.
  opts.imagePath = path.resolve(process.cwd(), opts.imagePath || '');
  opts.spritePath = path.resolve(process.cwd(), opts.spritePath || '');

  // Add group retina images function.
  opts.groupBy.unshift((image) => {
    if (image.ratio > 1) {
      return `@${image.ratio}x`;
    }

    return null;
  });

  return opts;
}

exports.getDefaultOptions = getDefaultOptions;
exports.pluginOptions = pluginOptions;
