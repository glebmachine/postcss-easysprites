const rewire = require('rewire');
const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');

chai.use(chaiAsPromised);
const { expect } = chai;

const sprites = rewire('../lib/sprites');
const { getRetinaPadding } = require('../lib/retina-images');

/* eslint-disable func-names */
describe('Build sprites', function() {
  it('sprite save should throw promise rejection error', function(done) {
    const testImages = [
      {
        path: '',
        url: 'images/arrow-next.png#elements',
        stylesheetPath: './test/fixtures',
        ratio: 1,
        groups: ['elements'],
        token: {},
        hash: 'elements',
      },
    ];

    const testSprites = [
      {
        coordinates: {
          '': {},
        },
        properties: { width: 28, height: 27 },
        image: '',
        groups: ['elements'],
        path: '',
        isFromCache: false,
      },
    ];

    const saveSpriteFile = () => {
      return Promise.reject(new Error('saveSpriteFile failed'));
    };

    /* eslint-disable no-underscore-dangle */
    sprites.__set__('saveSpriteFile', saveSpriteFile);

    expect(sprites.saveSprites(testImages, testSprites))
      .to.eventually.be.rejectedWith('saveSpriteFile failed')
      .notify(done);
  });

  it('should get default padding when retina padding cannot be calculated', function(done) {
    const defaultPadding = getRetinaPadding([], 20);

    expect(defaultPadding).to.equal(20);

    done();
  });
});
