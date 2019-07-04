const { expect } = require('chai');
const { pluginOptions } = require('../lib/plugin-options');

/* eslint-disable func-names */
describe('Default options', function() {
  it('should throw error when `stylesheetsPath` is not defined or cannot be determined', function(done) {
    const opts = pluginOptions;
    opts.init({});

    // opts.setStylesheetPath(null, null);
    expect(() => opts.setStylesheetPath()).to.throw(
      'Stylesheets path is undefined'
    );

    done();
  });

  it('should assign default options for any that are not defined by the user', function(done) {
    const opts = pluginOptions;
    opts.init({});
    opts.setStylesheetPath(null, 'path/to/css/file/image.png');
    const defaultOptions = opts.getAll();

    expect(defaultOptions.groupBy).to.be.an('array');
    expect(defaultOptions.imagePath).to.equal(process.cwd());
    expect(defaultOptions.spritePath).to.equal(process.cwd());
    expect(defaultOptions.stylesheetPath).to.equal('path/to/css/file');
    expect(defaultOptions.padding).to.equal(20);
    expect(defaultOptions.algorithm).to.equal('binary-tree');

    done();
  });
});
