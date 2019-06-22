"use strict"

const postcss = require('postcss');
const { expect } = require('chai');
const StdOutFixture = require('fixture-stdout');
const plugin = require('../');

const fixture = new StdOutFixture();
const { getTestOptions, assertEqual } = require('./test-utils');

// Keep track of writes so we can check them later..
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

    // If you return `false`, you'll prevent the write to the original stream (useful for preventing log output during tests.)
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
  it('Create sprite to test caching', function(done) {
    assertEqual(
      'a { background: url("/images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('Assert sprite not cached', function(done) {
    assertNotCached(
      'a { background: url("images/arrow-next_hover.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('Assert sprite cached', function(done) {
    assertCached(
      'a { background: url("images/arrow-next_hover.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });
});
