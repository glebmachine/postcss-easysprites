const postcss = require('postcss');
const { expect } = require('chai');
const StdOutFixture = require('fixture-stdout');
const plugin = require('../');

const fixture = new StdOutFixture();

// Keep track of writes so we can check them later..
const logCapture = [];

const testOptions = {
  imagePath: './test/basic',
  stylesheetPath: './test/basic', // need here cause of inline call
  spritePath: './test/basic/sprites',
};

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
      /* eslint-disable no-unused-expressions */
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
      /* eslint-disable no-unused-expressions */
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

describe('postcss-easysprites: basic', () => {
  it('Relative images test', (done) => {
    assert(
      'a { background:url("images/arrow-next.png#elements"); }',
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
      JSON.parse(JSON.stringify(testOptions)),
      done
    );
  });

  it('Background image property test', (done) => {
    assert(
      'a { background-image: url("images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      {
        stylesheetPath: './test/basic',
        spritePath: './test/basic/sprites',
      },
      done
    );
  });

  it('Retina images test', (done) => {
    assert(
      'a { background: url("/images/arrow-next@2x.png#elements"); }',
      'a { background-image: url(sprites/elements@2x.png); background-position: 0 0; background-size: 28px 27px; }',
      JSON.parse(JSON.stringify(testOptions)),
      done
    );
  });

  it('Not exists image test', (done) => {
    assert(
      'a { background: url("/images/image-not-exists.png#elements"); }',
      'a { background: url("/images/image-not-exists.png"); }',
      JSON.parse(JSON.stringify(testOptions)),
      done
    );
  });
});

describe('postcss-easysprites: colors', () => {
  it('Hex background color test', (done) => {
    assert(
      'a { background: #000000 url("/images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; background-color: #000000; }',
      JSON.parse(JSON.stringify(testOptions)),
      done
    );
  });

  it('RGB background color test', (done) => {
    assert(
      'a { background: rgb(0, 0, 0) url("/images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; background-color: rgb(0, 0, 0); }',
      JSON.parse(JSON.stringify(testOptions)),
      done
    );
  });

  it('RGBa background color test', (done) => {
    assert(
      'a { background: rgba(0, 0, 0, 1) url("/images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; background-color: rgba(0, 0, 0, 1); }',
      JSON.parse(JSON.stringify(testOptions)),
      done
    );
  });

  it('HSL background color test', (done) => {
    assert(
      'a { background: hsl(0,100%, 50%) url("/images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; background-color: hsl(0,100%, 50%); }',
      JSON.parse(JSON.stringify(testOptions)),
      done
    );
  });

  it('HSLa background color test', (done) => {
    assert(
      'a { background: hsla(0,100%, 50%, 1) url("/images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; background-color: hsla(0,100%, 50%, 1); }',
      JSON.parse(JSON.stringify(testOptions)),
      done
    );
  });
});

describe('postcss-easysprites: caching', () => {
  it('Assert sprite not cached', (done) => {
    assertNotCached(
      'a { background: url("images/arrow-next_hover.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      JSON.parse(JSON.stringify(testOptions)),
      done
    );
  });

  it('Assert sprite cached', (done) => {
    assertCached(
      'a { background: url("images/arrow-next_hover.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      JSON.parse(JSON.stringify(testOptions)),
      done
    );
  });
});
