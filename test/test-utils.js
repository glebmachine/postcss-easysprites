const postcss = require('postcss');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');
const plugin = require('..');

const getTestOptions = () => {
  return JSON.parse(
    JSON.stringify({
      imagePath: './test/fixtures',
      stylesheetPath: './test/fixtures',
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

/**
 * Gets all of generated sprite filenames.
 *
 * @param {Array} directory - The sprite files directory.
 *
 * @returns {Array}
 */
const getSpriteFilenames = (directory) => {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (error, files) => {
      if (error) {
        reject(error); // handling error.
      } else {
        resolve(files);
      }
    });
  });
};

const assertVisuallyEqual = (testDir, referenceDir, opts, done) => {
  const options = opts || getTestOptions();

  fs.readFile(
    path.resolve(__dirname, 'fixtures/input.css'),
    'utf8',
    (err, css) => {
      postcss([plugin(options)])
        .process(css, {
          from: undefined,
        })
        .then(() => {
          const threshold = 0.1;

          getSpriteFilenames(testDir)
            .then((values) => {
              values.forEach((fileName) => {
                const testImage = PNG.sync.read(
                  fs.readFileSync(`${testDir}/${fileName}`)
                );
                const referenceImage = PNG.sync.read(
                  fs.readFileSync(`${referenceDir}/${fileName}`)
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

              done();
            })
            .catch((error) => {
              done(error);
            });
        })
        .catch((error) => {
          done(error);
        });
    }
  );
};

exports.getTestOptions = getTestOptions;
exports.assertEqual = assertEqual;
exports.getSpriteFilenames = getSpriteFilenames;
exports.assertVisuallyEqual = assertVisuallyEqual;
