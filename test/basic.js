const postcss = require('postcss');
const { expect } = require('chai');
const StdOutFixture = require('fixture-stdout');
const plugin = require('../');

const fixture = new StdOutFixture();

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

const assert = (input, output, opts, done) => {
  postcss([plugin(opts)])
    .process(input, { from: undefined })
    .then((result) => {
      expect(result.css).to.eql(output);
      expect(result.warnings()).to.be.empty;
      done();
    })
    .catch((error) => {
      done(error);
    });
};

const assertNotCached = (input, output, opts, done) => {
  // Start stdout log capture.
  cacheLog();

  postcss([plugin(opts)])
    .process(input, { from: undefined })
    .then((result) => {
      expect(result.css).to.eql(output);
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

describe('postcss-easysprites', () => {
  it('Relative images test', (done) => {
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

  it('Absolute images test', (done) => {
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

  it('Retina images test', (done) => {
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

  it('Not exists image test', (done) => {
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

  it('Hex background color test', (done) => {
    assert(
      'a { background: #000000 url("/images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      {
        imagePath: './test/basic',
        stylesheetPath: './test/basic', // need here cause of inline call
        spritePath: './test/basic/sprites',
      },
      done
    );
  });

  it('Assert sprite not cached', (done) => {
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

  it('Assert sprite cached', (done) => {
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
