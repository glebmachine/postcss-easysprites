const { expect } = require('chai');
const postcss = require('postcss');
const StdOutFixture = require('fixture-stdout');
const plugin = require('../');

const { getTestOptions, assertEqual } = require('./test-utils');

const fixture = new StdOutFixture();

// Keep track of writes so we can check them later.
const logCapture = [];

/**
 * Saves the console output so previous messages can be retrieved.
 *
 * @returns {undefined}
 */
function cacheLog() {
  // Capture a write to stdout
  fixture.capture(function onWrite(string) {
    logCapture.push(string);

    // If you return `false`, you'll prevent the write to the original stream
    // (useful for preventing log output during tests.)
    return true;
  });
}

/**
 * Retrieves the saved console output messages.
 *
 * @returns {string}
 */
function uncacheLog() {
  return logCapture.toString();
}

const assertNotCached = (input, output, opts, done) => {
  // Start stdout log capture.
  cacheLog();

  postcss([plugin(opts)])
    .process(input, { from: undefined })
    .then((result) => {
      expect(result.css).to.eql(output);
      // eslint-disable-next-line
      expect(result.warnings()).to.be.empty;

      // Stop stdout capture.
      fixture.release();

      if (uncacheLog().indexOf('generated') === -1) {
        return done(new Error('Sprite already cached, code red!'));
      }

      return done();
    })
    .catch((error) => {
      done(error);
    });
};

const assertCached = (input, output, opts, done) => {
  // Start stdout log capture.
  cacheLog();

  postcss([plugin(opts)])
    .process(input, { from: undefined })
    .then((result) => {
      expect(result.css).to.eql(output);

      // eslint-disable-next-line
      expect(result.warnings()).to.be.empty;

      // Stop stdout capture.
      fixture.release();

      if (uncacheLog().indexOf('unchanged') === -1) {
        return done(new Error('Cache is not working'));
      }

      return done();
    })
    .catch((error) => {
      done(error);
    });
};

/* eslint-disable func-names */
describe('Caching', function() {
  // before(function(done) {
  // rimraf('./test/basic/sprites/*', done);
  // exec('rm -Rf ./test/basic/sprites/directory-does-not-exist', done);
  // runs after all tests in this block
  // });

  it('should create sprite to that will be cached', function(done) {
    assertEqual(
      'a { background: url("/images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('assert sprite not cached', function(done) {
    assertNotCached(
      'a { background: url("images/arrow-next_hover.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('assert sprite cached', function(done) {
    assertCached(
      'a { background: url("images/arrow-next_hover.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });
});
