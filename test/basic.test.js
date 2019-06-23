const rimraf = require('rimraf');
const { getTestOptions, assertEqual } = require('./test-utils');

/* eslint-disable func-names */
describe('fixtures', function() {
  beforeEach(function(done) {
    rimraf('./test/fixtures/sprites', done);
  });

  afterEach(function(done) {
    rimraf('./test/fixtures/sprites', done);
  });

  it('should process images defined with the `background-image` property', function(done) {
    assertEqual(
      'a { background-image: url("images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('should process retina images', function(done) {
    assertEqual(
      'a { background: url("/images/arrow-next@2x.png#elements"); }',
      'a { background-image: url(sprites/elements@2x.png); background-position: 0 0; background-size: 28px 27px; }',
      getTestOptions(),
      done
    );
  });

  it('should skip sprite generation when an image does not exist', function(done) {
    assertEqual(
      'a { background: url("/images/image-not-exists.png#elements"); }',
      'a { background: url("/images/image-not-exists.png"); }',
      getTestOptions(),
      done
    );
  });

  it('should process multiple background images', function(done) {
    assertEqual(
      'a { background: url("/images/arrow-next.png#elements"); } a:hover { background: url("/images/arrow-next--hover.png#elements"); } a:focus { background: url("/images/arrow-previous.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; } a:hover { background-image: url(sprites/elements.png); background-position: -48px 0; } a:focus { background-image: url(sprites/elements.png); background-position: 0 -47px; }',
      getTestOptions(),
      done
    );
  });

  it('should output correct sprite dimensions when the `outputDimensions` is true', function(done) {
    const testOptions = getTestOptions();
    testOptions.outputDimensions = true;

    assertEqual(
      'a { background-image: url("images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; width: 28px; height: 27px; }',
      testOptions,
      done
    );
  });

  it('should output correct retina sprite dimensions when the `outputDimensions` is true', function(done) {
    const testOptions = getTestOptions();
    testOptions.outputDimensions = true;

    assertEqual(
      'a { background: url("images/arrow-next@2x.png#elements"); }',
      'a { background-image: url(sprites/elements@2x.png); background-position: 0 0; background-size: 28px 27px; width: 28px; height: 27px; }',
      testOptions,
      done
    );
  });

  it('should remove any existing background-position property', function(done) {
    assertEqual(
      'a { background-image: url("images/arrow-next.png#elements"); background-position: center; }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('should work with custom padding options', function(done) {
    const testOptions = getTestOptions();
    testOptions.padding = 100;

    assertEqual(
      'a { background-image: url("images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      testOptions,
      done
    );
  });

  it('should skip rules without background image url properties', function(done) {
    assertEqual('a { }', 'a { }', getTestOptions(), done);
  });

  it('should skip background rules when the url property is not defined', function(done) {
    assertEqual(
      'a { background: transparent }',
      'a { background: transparent }',
      getTestOptions(),
      done
    );
  });

  it('should not process CSS comment which have background image properties', function(done) {
    assertEqual(
      'a { background-image: url("/images/arrow-next.png#elements"); } /** background-image: url("/images/arrow-next--hover.png#elements") */',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; } /** background-image: url("/images/arrow-next--hover.png#elements") */',
      getTestOptions(),
      done
    );
  });

  it('should not replace tokens in comments', function(done) {
    assertEqual(
      'a { background-image: url("/images/arrow-next.png#elements"); } /** background-image: url("@replace|images/arrow-next.png#elements") */',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; } /** background-image: url("@replace|images/arrow-next.png#elements") */',
      getTestOptions(),
      done
    );
  });
});
