const postcss = require('postcss');
const rewire = require('rewire');
const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');

chai.use(chaiAsPromised);
const { expect } = chai;
const { getTestOptions } = require('./test-utils');

const plugin = rewire('../');

/* eslint-disable func-names */
describe('Plugin processes', function() {
  it('plugin should throw promise rejection error', function(done) {
    const opts = getTestOptions();

    const updateReferences = () => {
      return Promise.reject(new Error('updateReferences failed'));
    };

    /* eslint-disable no-underscore-dangle */
    plugin.__set__('updateReferences', updateReferences);

    const run = async () => {
      try {
        return await postcss([plugin(opts)]).process('', {
          from: undefined,
        });
      } catch (error) {
        return Promise.reject(error);
      }
    };

    expect(run())
      .to.eventually.be.rejectedWith('updateReferences failed')
      .notify(done);
  });
});
