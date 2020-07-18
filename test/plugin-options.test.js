const { expect } = require('chai');
const { pluginOptions } = require('../lib/plugin-options');

/* eslint-disable func-names */
describe('Default options', function() {
  it('should throw error when `stylesheetsPath` is not defined or cannot be determined', function(done) {
    expect(() => pluginOptions.init()).to.throw(
      'Stylesheets path is undefined'
    );

    done();
  });

  it('should assign default options for any that are not defined by the user', function(done) {
    const opts = pluginOptions.init({}, 'path/to/css/file/image.png');

    expect(opts.imagePath).to.equal(process.cwd());
    expect(opts.spritePath).to.equal(process.cwd());
    expect(opts.stylesheetPath).to.equal('path/to/css/file');
    expect(opts.outputStylesheetPath).to.equal(undefined);
    expect(opts.padding).to.equal(20);
    expect(opts.algorithm).to.equal('binary-tree');

    done();
  });

  it('should assign custom outputStylesheetPath path if defined by the user', function(done) {
    const opts = pluginOptions.init(
      { outputStylesheetPath: '/my/custom/path' },
      'path/to/css/file/image.png'
    );

    expect(opts.outputStylesheetPath).to.equal('/my/custom/path');

    done();
  });
});
