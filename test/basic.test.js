const chai = require('chai');
const sinon = require('sinon');
const path = require('path');
const rimraf = require('rimraf');
// const chaiAsPromised = require('chai-as-promised');

const { expect } = chai;
const { collectImages } = require('../lib/collect-images');
const { getTestOptions, assertEqual } = require('./test-utils');

// chai.use(chaiAsPromised);

/* eslint-disable func-names */
describe('Basic', function() {
  beforeEach(function(done) {
    rimraf('./test/basic/sprites', done);
  });

  afterEach(function(done) {
    rimraf('./test/basic/sprites', done);
  });

  it('Relative images test', function(done) {
    assertEqual(
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
    assertEqual(
      'a { background: url("/images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('Background image property test', function(done) {
    assertEqual(
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
    assertEqual(
      'a { background: url("/images/arrow-next@2x.png#elements"); }',
      'a { background-image: url(sprites/elements@2x.png); background-position: 0 0; background-size: 28px 27px; }',
      getTestOptions(),
      done
    );
  });

  it('Not exists image test', function(done) {
    assertEqual(
      'a { background: url("/images/image-not-exists.png#elements"); }',
      'a { background: url("/images/image-not-exists.png"); }',
      getTestOptions(),
      done
    );
  });

  it('multiple images', function(done) {
    assertEqual(
      'a { background: url("/images/arrow-next.png#elements"); } a:hover { background: url("/images/arrow-next_hover.png#elements"); } a:focus { background: url("/images/arrow-previous.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; } a:hover { background-image: url(sprites/elements.png); background-position: -48px 0; } a:focus { background-image: url(sprites/elements.png); background-position: 0 -47px; }',
      getTestOptions(),
      done
    );
  });

  it('no background url', function(done) {
    assertEqual(
      'a { background: #000 url(); }',
      'a { background: #000 url(); }',
      getTestOptions(),
      done
    );
  });

  it('output dimensions', function(done) {
    assertEqual(
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
    assertEqual(
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
    assertEqual(
      'a { background-image: url("images/arrow-next.png#elements"); background-position: center; }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('custom padding', function(done) {
    assertEqual(
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

  it('create new sprite directory', function(done) {
    assertEqual(
      'a { background:url("images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/directory-does-not-exist/elements.png); background-position: 0 0; }',
      {
        stylesheetPath: './test/basic',
        spritePath: './test/basic/sprites/directory-does-not-exist',
      },
      done
    );
  });

  it('has no sprite path', function(done) {
    const css = {
      source: {
        input: {
          file: '',
        },
      },
    };

    const opts = {
      stylesheetPath: '',
    };

    const stubDirname = () => {
      return '';
    };

    const dirnameStub = sinon.stub(path, 'dirname').callsFake(stubDirname);

    expect(collectImages.bind(collectImages, css, opts)).to.throw(
      'Stylesheets path is undefined, please use option stylesheetPath!'
    );

    dirnameStub.restore();
    done();
  });

  it('has no image in rule', function(done) {
    assertEqual('a { }', 'a { }', getTestOptions(), done);
  });

  it('only tokens with background image rules', function(done) {
    assertEqual(
      'a { background: transparent }',
      'a { background: transparent }',
      getTestOptions(),
      done
    );
  });

  it('only comments with tokens', function(done) {
    assertEqual(
      'a { background-image: url("/images/arrow-next.png#elements"); } /** background-image: url("/images/arrow-next_hover.png#elements") */',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; } /** background-image: url("/images/arrow-next_hover.png#elements") */',
      getTestOptions(),
      done
    );
  });

  it('only tokens without background image declarations', function(done) {
    assertEqual(
      'a { background-image: url("/images/arrow-next.png#elements"); } /** background-image: url("@replace|images/arrow-next.png#elements") */',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; } /** background-image: url("@replace|images/arrow-next.png#elements") */',
      getTestOptions(),
      done
    );
  });
});
