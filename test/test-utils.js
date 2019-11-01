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

const assertEqual = async (input, output, opts, done) => {
  try {
    const result = await postcss([plugin(opts)]).process(input, {
      from: undefined,
    });

    expect(result.css).to.eql(output);

    // eslint-disable-next-line
    expect(result.warnings()).to.be.empty;

    done();
  } catch (error) {
    done(error);
  }
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

  /**
   * Visual regression test.
   *
   * @param {object} err - Error callback.
   * @param {object} css - CSS file object.
   *
   * @returns {Function}
   */
  async function visualTest(err, css) {
    try {
      await postcss([plugin(options)]).process(css, {
        from: undefined,
      });

      const threshold = 0.1;

      const values = await getSpriteFilenames(testDir);

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
    } catch (error) {
      done(error);
    }
  }

  fs.readFile(
    path.resolve(__dirname, 'fixtures/input.css'),
    'utf8',
    // eslint-disable-next-line
    (err, css) => visualTest(err, css)
  );
};

module.exports.getTestOptions = getTestOptions;
module.exports.assertEqual = assertEqual;
module.exports.getSpriteFilenames = getSpriteFilenames;
module.exports.assertVisuallyEqual = assertVisuallyEqual;
