
var postcss = require('postcss');
var expect  = require('chai').expect;
var plugin = require('../');

function cacheLog() {
  console.logback = console.log;
  console.log = function(){
    var args = Array.prototype.slice.call(arguments);
    console.logback.apply(console, ['cached'].concat(args));
    console.lastMessage = Array.prototype.slice.call(arguments).join(' ');
  };
}

function uncacheLog() {
  console.log = console.logback;
  return console.lastMessage;
}

var assert = function(input, output, opts, done) {
  postcss([plugin(opts)]).process(input).then(function(result) {
    expect(result.css).to.eql(output);
    expect(result.warnings()).to.be.empty;
    done();
  }).catch(function(error) {
    done(error);
  });
};

var assertCached = function(input, output, opts, done) {
  cacheLog();

  postcss([plugin(opts)]).process(input).then(function(result) {
    expect(result.css).to.eql(output);
    expect(result.warnings()).to.be.empty;

    if (uncacheLog().indexOf('unchanged') === -1) {
      return done(new Error('Cache is not working'));
    }

    done();
  }).catch(function(error) {
    done(error);
  });
};

var assertNotCached = function(input, output, opts, done) {
  cacheLog();

  postcss([plugin(opts)]).process(input).then(function(result) {
    expect(result.css).to.eql(output);
    expect(result.warnings()).to.be.empty;
    if (uncacheLog().indexOf('generated') === -1) {
      return done(new Error('Sprite already cached, code red!'));
    }

    done();
  }).catch(function(error) {
    done(error);
  });
};

describe('postcss-easysprites', function() {

  it('Relative images test', function(done) {
    assert(
      'a { background: url("images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      {
        stylesheetPath:'./test/basic',
        spritePath: './test/basic/sprites',
      }, done);
  });

  it('Absolute images test', function(done) {
    assert(
      'a { background: url("/images/arrow-next.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      {
        imagePath:'./test/basic',
        stylesheetPath:'./test/basic', // need here cause of inline call
        spritePath: './test/basic/sprites',
      }, done);
  });

  it('Retina images test', function(done) {
    assert(
      'a { background: url("/images/arrow-next@2x.png#elements"); }',
      'a { background-image: url(sprites/elements@2x.png); background-position: 0 0; background-size: 28px 27px; }',
      {
        imagePath:'./test/basic',
        stylesheetPath:'./test/basic', // need here cause of inline call
        spritePath: './test/basic/sprites',
      }, done);
  });

  it('Not exists image test', function(done) {
    assert(
      'a { background: url("/images/image-not-exists.png#elements"); }',
      'a { background: url("/images/image-not-exists.png"); }',
      {
        imagePath:'./test/basic',
        stylesheetPath:'./test/basic', // need here cause of inline call
        spritePath: './test/basic/sprites',
      }, done);
  });

  it('Assert sprite not cached', function(done) {
    assertNotCached(
      'a { background: url("images/arrow-next_hover.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      {
        imagePath:'./test/basic',
        stylesheetPath:'./test/basic', // need here cause of inline call
        spritePath: './test/basic/sprites',
      }, done);
  });

  it('Assert sprite cached', function(done) {
    assertCached(
      'a { background: url("images/arrow-next_hover.png#elements"); }',
      'a { background-image: url(sprites/elements.png); background-position: 0 0; }',
      {
        imagePath:'./test/basic',
        stylesheetPath:'./test/basic', // need here cause of inline call
        spritePath: './test/basic/sprites',
      }, done);
  });

});
