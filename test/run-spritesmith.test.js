const rewire = require('rewire');
const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');

chai.use(chaiAsPromised);
const { expect } = chai;

const spritesmithModule = rewire('../lib/run-spritesmith');

/* eslint-disable func-names */
describe('Run Spritemith', function() {
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

    expect(spritesmithModule.runSpritesmith(testImages))
      .to.eventually.be.rejectedWith('Spritesmith failed to generate sprites')
      .notify(done);
  });
});
