const postcss = require('postcss');
const { expect } = require('chai');
const StdOutFixture = require('fixture-stdout');
const plugin = require('../');

const fixture = new StdOutFixture();

// Keep track of writes so we can check them later..
const logCapture = [];

const getTestOptions = () => {
  return JSON.parse(
    JSON.stringify({
      imagePath: './test/basic',
      stylesheetPath: './test/basic', // need here cause of inline call
      spritePath: './test/basic/sprites',
    })
  );
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
      // eslint-disable-next-line
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
describe('Basic', function() {
  it('Relative images test', function(done) {
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

  it('Absolute images test', function(done) {
    assert(
      'a { background: url("/images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('Background image property test', function(done) {
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

  it('Retina images test', function(done) {
    assert(
      'a { background: url("/images/arrow-next@2x.png#elements"); }',
      'a { background-image: url(sprites/elements@2x.png); background-position: 0 0; background-size: 28px 27px; }',
      getTestOptions(),
      done
    );
  });

  it('Not exists image test', function(done) {
    assert(
      'a { background: url("/images/image-not-exists.png#elements"); }',
      'a { background: url("/images/image-not-exists.png"); }',
      getTestOptions(),
      done
    );
  });

  it('multiple images', function(done) {
    assert(
      'a { background: url("/images/arrow-next.png#elements"); } a:hover { background: url("/images/arrow-next_hover.png#elements"); } a:focus { background: url("/images/arrow-previous.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; } a:hover { background-image: url(sprites/elements.png); background-position: -48px 0; } a:focus { background-image: url(sprites/elements.png); background-position: 0 -47px; }',
      getTestOptions(),
      done
    );
  });

  it('no background url', function(done) {
    assert(
      'a { background: #000 url(); }',
      'a { background: #000 url(); }',
      getTestOptions(),
      done
    );
  });

  it('output dimensions', function(done) {
    assert(
      'a { background-image: url("images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; width: 28px; height: 27px; }',
      {
        stylesheetPath: './test/basic',
        spritePath: './test/basic/sprites',
        outputDimensions: true,
      },
      done
    );
  });

  it('output retina dimensions', function(done) {
    assert(
      'a { background: url("images/arrow-next@2x.png#elements"); }',
      'a { background-image: url(sprites/elements@2x.png); background-position: 0 0; background-size: 28px 27px; width: 28px; height: 27px; }',
      {
        stylesheetPath: './test/basic',
        spritePath: './test/basic/sprites',
        outputDimensions: true,
      },
      done
    );
  });

  it('remove existing background-position', function(done) {
    assert(
      'a { background-image: url("images/arrow-next.png#elements"); background-position: center; }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('no padding', function(done) {
    assert(
      'a { background-image: url("images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      {
        stylesheetPath: './test/basic',
        spritePath: './test/basic/sprites',
        padding: 100,
      },
      done
    );
  });
});

describe('Background Color', function() {
  it('should extract the hexadecimal color to a separate `background-color` declaration.', function(done) {
    assert(
      'a { background: #000000 url("/images/arrow-next.png#elements"); }',
      'a { background-color: #000000; background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('should extract the RGB color to a separate `background-color` declaration.', function(done) {
    assert(
      'a { background: rgb(0, 0, 0) url("/images/arrow-next.png#elements"); }',
      'a { background-color: rgb(0, 0, 0); background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('should extract the RGBa color to a separate `background-color` declaration.', function(done) {
    assert(
      'a { background: rgba(0, 0, 0, 1) url("/images/arrow-next.png#elements"); }',
      'a { background-color: rgba(0, 0, 0, 1); background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('should extract the  HSL color to a separate `background-color` declaration.', function(done) {
    assert(
      'a { background: hsl(0,100%, 50%) url("/images/arrow-next.png#elements"); }',
      'a { background-color: hsl(0,100%, 50%); background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('should extract the HSLa color to a separate `background-color` declaration.', function(done) {
    assert(
      'a { background: hsla(0,100%, 50%, 1) url("/images/arrow-next.png#elements"); }',
      'a { background-color: hsla(0,100%, 50%, 1); background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });
});

describe('Caching', function() {
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
