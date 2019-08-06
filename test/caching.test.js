const { expect } = require('chai');
const postcss = require('postcss');
const StdOutFixture = require('fixture-stdout');
const rimraf = require('rimraf');
const plugin = require('../');
const { getTestOptions } = require('./test-utils');

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

const assertNotCached = async (input, output, opts, done) => {
  // Start stdout log capture.
  cacheLog();

  try {
    const result = await postcss([plugin(opts)]).process(input, {
      from: undefined,
    });

    expect(result.css).to.eql(output);

    // eslint-disable-next-line
    expect(result.warnings()).to.be.empty;

    // Stop stdout capture.
    fixture.release();

    if (uncacheLog().indexOf('generated') === -1) {
      return done(new Error('Sprite already cached, code red!'));
    }
  } catch (error) {
    done(error);
  }

  return done();
};

const assertCached = async (input, output, opts, done) => {
  // Start stdout log capture.
  cacheLog();

  try {
    const result = await postcss([plugin(opts)]).process(input, {
      from: undefined,
    });

    expect(result.css).to.eql(output);

    // eslint-disable-next-line
    expect(result.warnings()).to.be.empty;

    // Stop stdout capture.
    fixture.release();

    if (uncacheLog().indexOf('unchanged') === -1) {
      return done(new Error('Cache is not working'));
    }
  } catch (error) {
    done(error);
  }

  return done();
};

/* eslint-disable func-names */
describe('Caching', function() {
  before(function(done) {
    rimraf('./test/fixtures/sprites', done);
  });

  it('should not find a cached version of the generated sprite', function(done) {
    assertNotCached(
      'a { background: url("images/arrow-next--hover.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('should find and use the previously generated sprite that was cached', function(done) {
    assertCached(
      'a { background: url("images/arrow-next--hover.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });
});
