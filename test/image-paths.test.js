const { expect } = require('chai');
const sinon = require('sinon');
const path = require('path');
const rimraf = require('rimraf');

const { collectImages } = require('../lib/collect-images');
const { getTestOptions, assertEqual } = require('./test-utils');

/* eslint-disable func-names */
describe('Image Paths', function() {
  beforeEach(function(done) {
    rimraf('./test/fixtures/sprites', done);
  });

  afterEach(function(done) {
    rimraf('./test/fixtures/sprites', done);
  });

  it('should process images with relative urls', function(done) {
    assertEqual(
      'a { background:url("images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('should process images with absolute urls', function(done) {
    assertEqual(
      'a { background: url("/images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('should skip process when no url property is defined', function(done) {
    assertEqual(
      'a { background: #000 url(); }',
      'a { background: #000 url(); }',
      getTestOptions(),
      done
    );
  });

  it('should create a new sprite out directory when one does not exist', function(done) {
    const testOptions = getTestOptions();
    testOptions.spritePath = './test/fixtures/sprites/directory-does-not-exist';

    assertEqual(
      'a { background:url("images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/directory-does-not-exist/elements.png); background-position: 0 0; }',
      testOptions,
      done
    );
  });

  it('should throw an error when the `stylesheetsPath` option is not set', function(done) {
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
});
