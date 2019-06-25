const path = require('path');
const rimraf = require('rimraf');
const { assertVisuallyEqual } = require('./test-utils');

/* eslint-disable func-names */
describe('Visual differences between generated and reference sprite images', function() {
  before(function(done) {
    rimraf('./test/fixtures/sprites', done);
  });

  after(function(done) {
    rimraf('./test/fixtures/sprites', done);
  });

  it('generated sprite images should match reference sprite images', function(done) {
    const testDir = path.resolve(__dirname, 'fixtures/sprites');
    const referenceDir = path.resolve(__dirname, 'fixtures/reference-sprites');
    assertVisuallyEqual(testDir, referenceDir, null, done);
  });
});
