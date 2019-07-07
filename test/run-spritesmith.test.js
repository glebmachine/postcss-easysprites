const rewire = require('rewire');
const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');

chai.use(chaiAsPromised);
const { expect } = chai;

const spritesmithModule = rewire('../lib/run-spritesmith');

/* eslint-disable func-names */
describe('Run Spritemith', function() {
  // it('spritesmithAsync should throw promise rejection error', function(done) {
  //   const testImages = [
  //     {
  //       path:
  //         '/Users/patrickcate/git/postcss-easysprites/test/fixtures/images/arrow-next.png',
  //       url: 'images/arrow-next.png#elements',
  //       stylesheetPath: './test/fixtures',
  //       ratio: 1,
  //       groups: ['elements'],
  //       token: {},
  //       hash: 'elements',
  //     },
  //   ];

  //   const spritesmithAsync = () => {
  //     console.log('I FASILFDJDL:IFJDS :F');
  //     return Promise.reject(new Error('spritesmithAsync failed'));
  //   };

  //   /* eslint-disable no-underscore-dangle */
  //   spritesmithModule.__set__('spritesmithAsync', spritesmithAsync);

  //   expect(spritesmithModule.runSpriteSmith(testImages))
  //     .to.eventually.be.rejectedWith('spritesmithAsync failed')
  //     .notify(done);
  // });

  it('spritesmith should throw promise rejection error', function(done) {
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

    // const allSprites = () => {
    //   console.log('I failed');
    //   return Promise.reject(new Error('spritesmithAsync failed'));
    // };

    // /* eslint-disable no-underscore-dangle */
    // spritesmithModule.__set__('allSprites', allSprites);

    expect(spritesmithModule.runSpriteSmith(testImages))
      .to.eventually.be.rejectedWith('Spritesmith failed to generate sprites')
      .notify(done);
  });
});
