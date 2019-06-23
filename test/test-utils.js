const postcss = require('postcss');
const { expect } = require('chai');
const plugin = require('../');

const getTestOptions = () => {
  return JSON.parse(
    JSON.stringify({
      imagePath: './test/fixtures',
      stylesheetPath: './test/fixtures', // Needed because of inline call.
      spritePath: './test/fixtures/sprites',
    })
  );
};

const assertEqual = (input, output, opts, done) => {
  postcss([plugin(opts)])
    .process(input, { from: undefined })
    .then((result) => {
      expect(result.css).to.eql(output);

      // eslint-disable-next-line
      expect(result.warnings()).to.be.empty;
      done();
    })
    .catch((error) => {
      done(error);
    });
};

exports.getTestOptions = getTestOptions;
exports.assertEqual = assertEqual;
