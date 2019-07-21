const rewire = require('rewire');
const { expect } = require('chai');

const collectImagesModule = rewire('../lib/collect-images');

/* eslint-disable func-names */
describe('Image Exists', function() {
  it('should throw error when path is not defined', function(done) {
    const image = {
      path: undefined,
    };

    const fileExistsAsync = () => {
      return Promise.reject(new Error('fileExistsAsync failed'));
    };

    /* eslint-disable no-underscore-dangle */
    collectImagesModule.__set__('fileExistsAsync', fileExistsAsync);

    expect(collectImagesModule.imageExists(image))
      .to.eventually.be.rejectedWith('fileExistsAsync failed')
      .notify(done);
  });
});
