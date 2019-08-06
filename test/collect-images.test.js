const rewire = require('rewire');
const { expect } = require('chai');
const util = require('util');

const setTimeoutPromise = util.promisify(setTimeout);
const collectImagesModule = rewire('../lib/collect-images');

/* eslint-disable func-names */
describe('Image Exists', function() {
  it('should throw error when path is not defined', function(done) {
    const image = {
      path: undefined,
    };

    const fileExistsAsync = async () => {
      await setTimeoutPromise(1000, 'fileExistsAsync failed').then(
        (message) => {
          throw new Error(message);
        }
      );
    };

    /* eslint-disable no-underscore-dangle */
    collectImagesModule.__set__('fileExistsAsync', fileExistsAsync);

    expect(collectImagesModule.imageExists(image))
      .to.eventually.be.rejectedWith('fileExistsAsync failed')
      .notify(done);
  });
});
