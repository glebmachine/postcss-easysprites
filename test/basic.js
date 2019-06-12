'use strict';

var postcss = require('postcss');
var expect = require('chai').expect;
var plugin = require('../');
var StdOutFixture = require('fixture-stdout');
var fixture = new StdOutFixture();

// Keep track of writes so we can check them later..
var logCapture = [];

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

var assert = function(input, output, opts, done) {
  postcss([plugin(opts)])
    .process(input, { from: undefined })
    .then(function(result) {
      expect(result.css).to.eql(output);
      expect(result.warnings()).to.be.empty;
      done();
    })
    .catch(function(error) {
      done(error);
    });
};

var assertNotCached = function(input, output, opts, done) {
  // Start stdout log capture.
  cacheLog();

  postcss([plugin(opts)])
    .process(input, { from: undefined })
    .then(function(result) {
      expect(result.css).to.eql(output);
      expect(result.warnings()).to.be.empty;

      // Stop stdout capture.
      fixture.release();

      if (uncacheLog().indexOf('generated') === -1) {
        return done(new Error('Sprite already cached, code red!'));
      }

      done();
    })
    .catch(function(error) {
      done(error);
    });
};

var assertCached = function(input, output, opts, done) {
  // Start stdout log capture.
  cacheLog();

  postcss([plugin(opts)])
    .process(input, { from: undefined })
    .then(function(result) {
      expect(result.css).to.eql(output);
      expect(result.warnings()).to.be.empty;

      // Stop stdout capture.
      fixture.release();

      if (uncacheLog().indexOf('unchanged') === -1) {
        return done(new Error('Cache is not working'));
      }

      done();
    })
    .catch(function(error) {
      done(error);
    });
};

describe('postcss-easysprites', function() {
  it('Relative images test', function(done) {
    assert(
      'a { background: url("images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      {
        stylesheetPath: './test/basic',
        spritePath: './test/basic/sprites',
      },
      done
    );
  });

  it('Absolute images test', function(done) {
    assert(
      'a { background: url("/images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      {
        imagePath: './test/basic',
        stylesheetPath: './test/basic', // need here cause of inline call
        spritePath: './test/basic/sprites',
      },
      done
    );
  });

  it('Retina images test', function(done) {
    assert(
      'a { background: url("/images/arrow-next@2x.png#elements"); }',
      'a { background-image: url(sprites/elements@2x.png); background-position: 0 0; background-size: 28px 27px; }',
      {
        imagePath: './test/basic',
        stylesheetPath: './test/basic', // need here cause of inline call
        spritePath: './test/basic/sprites',
      },
      done
    );
  });

  it('Not exists image test', function(done) {
    assert(
      'a { background: url("/images/image-not-exists.png#elements"); }',
      'a { background: url("/images/image-not-exists.png"); }',
      {
        imagePath: './test/basic',
        stylesheetPath: './test/basic', // need here cause of inline call
        spritePath: './test/basic/sprites',
      },
      done
    );
  });

  it('Assert sprite not cached', function(done) {
    assertNotCached(
      'a { background: url("images/arrow-next_hover.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      {
        imagePath: './test/basic',
        stylesheetPath: './test/basic', // need here cause of inline call
        spritePath: './test/basic/sprites',
      },
      done
    );
  });

  it('Assert sprite cached', function(done) {
    assertCached(
      'a { background: url("images/arrow-next_hover.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      {
        imagePath: './test/basic',
        stylesheetPath: './test/basic', // need here cause of inline call
        spritePath: './test/basic/sprites',
      },
      done
    );
  });
});
