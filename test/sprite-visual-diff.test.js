const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const rimraf = require('rimraf');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');
const plugin = require('../');
// const { getTestOptions } = require('./test-utils');
// const output = fs.readFileSync(
//   path.resolve(__dirname, 'fixtures/output.css'),
//   'utf8'
// );

const getTestOptions = () => {
  return JSON.parse(
    JSON.stringify({
      imagePath: './test/fixtures',
      stylesheetPath: './test/fixtures', // Needed because of inline call.
      spritePath: './test/fixtures/sprites',
    })
  );
};

/**
 * Gets all of generated sprite filenames.
 *
 * @param {Array} directory - The sprite files directory.
 *
 * @returns {Array}
 */
function getSpriteFilenames(directory) {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (error, files) => {
      // handling error
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  });
}

/* eslint-disable func-names */
const assertVisuallyEqual = (done) => {
  fs.readFile(path.resolve(__dirname, 'demo/input.css'), 'utf8', (err, css) => {
    postcss([plugin(getTestOptions())])
      .process(css, {
        from: undefined,
      })
      .then((result) => {
        fs.writeFile(
          path.resolve(__dirname, 'demo/output.css'),
          result.css,
          () => true
        );

        const threshold = 0.1;

        getSpriteFilenames(path.resolve(__dirname, 'demo/sprites')).then(
          (values) => {
            values.forEach((fileName) => {
              const testImage = PNG.sync.read(
                fs.readFileSync(`./test/demo/sprites/${fileName}`)
              );
              const referenceImage = PNG.sync.read(
                fs.readFileSync(`./test/fixtures/reference-sprites/${fileName}`)
              );

              const { width, height } = referenceImage;

              const imageDiff = pixelmatch(
                testImage.data,
                referenceImage.data,
                null,
                width,
                height,
                {
                  threshold,
                }
              );

              expect(imageDiff).to.be.below(threshold);
            });
          }
        );

        done();
      })
      .catch((error) => {
        done(error);
      });
  });
};

/* eslint-disable func-names */
describe('Visual differences between generated and reference sprite images', function() {
  before(function(done) {
    rimraf('./test/fixtures/sprites', done);
  });

  after(function(done) {
    rimraf('./test/fixtures/sprites', done);
  });

  it('generated sprite images should match reference sprite images', function(done) {
    assertVisuallyEqual(done);
  });
});
