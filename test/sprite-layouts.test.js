const path = require('path');
const ansi = require('ansi-colors');
const { expect } = require('chai');
const sinon = require('sinon');
const rimraf = require('rimraf');
const { isValidLayout } = require('../lib/layouts');
const {
  getTestOptions,
  assertEqual,
  assertVisuallyEqual,
} = require('./test-utils');
const { SPRITE_LAYOUTS } = require('../lib/constants');

/* eslint-disable func-names */
describe('Sprite Layouts', function() {
  beforeEach(function(done) {
    rimraf('./test/fixtures/sprites', done);
  });

  afterEach(function(done) {
    rimraf('./test/fixtures/sprites', done);
  });

  it('should return `true` that all layouts are all valid', function(done) {
    SPRITE_LAYOUTS.forEach((layout) => {
      // eslint-disable-next-line
      expect(isValidLayout(layout)).to.be.true;
    });

    done();
  });

  it('should get a warning that the layout algorithm is not valid', function(done) {
    let warning = '';

    const stubConsole = (message) => {
      warning = message;
    };

    const consoleStub = sinon.stub(console, 'warn').callsFake(stubConsole);

    const notValidLayout = 'not-a-layout-algorithm';
    isValidLayout(notValidLayout);

    expect(warning).to.eql(
      ansi.red(
        `${notValidLayout} is not a valid sprite layout algorithm, the default 'binary-tree' will be used instead.`
      )
    );

    consoleStub.restore();

    done();
  });

  it('should fallback to default `binary-tree` layout when not defined', function(done) {
    const testOptions = getTestOptions();
    testOptions.algorithm = '';

    assertEqual(
      'a { background:url("images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      testOptions,
      done
    );
  });

  SPRITE_LAYOUTS.forEach((layout) => {
    it(`should generate '${layout}' sprite layout that match reference '${layout}' sprite layout image`, function(done) {
      const testOptions = getTestOptions();
      testOptions.algorithm = layout;

      const testDir = path.resolve(__dirname, 'fixtures/sprites');
      const referenceDir = path.resolve(
        __dirname,
        `fixtures/reference-sprites/layouts/${layout}`
      );

      assertVisuallyEqual(testDir, referenceDir, testOptions, done);
    });
  });
});
