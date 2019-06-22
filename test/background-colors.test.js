"use strict"

const { getTestOptions, assertEqual } = require('./test-utils');

/* eslint-disable func-names */
describe('Background Colors', function() {
  it('should extract the hexadecimal color to a separate `background-color` declaration.', function(done) {
    assertEqual(
      'a { background: #000000 url("/images/arrow-next.png#elements"); }',
      'a { background-color: #000000; background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('should extract the RGB color to a separate `background-color` declaration.', function(done) {
    assertEqual(
      'a { background: rgb(0, 0, 0) url("/images/arrow-next.png#elements"); }',
      'a { background-color: rgb(0, 0, 0); background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('should extract the RGBa color to a separate `background-color` declaration.', function(done) {
    assertEqual(
      'a { background: rgba(0, 0, 0, 1) url("/images/arrow-next.png#elements"); }',
      'a { background-color: rgba(0, 0, 0, 1); background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('should extract the  HSL color to a separate `background-color` declaration.', function(done) {
    assertEqual(
      'a { background: hsl(0,100%, 50%) url("/images/arrow-next.png#elements"); }',
      'a { background-color: hsl(0,100%, 50%); background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });

  it('should extract the HSLa color to a separate `background-color` declaration.', function(done) {
    assertEqual(
      'a { background: hsla(0,100%, 50%, 1) url("/images/arrow-next.png#elements"); }',
      'a { background-color: hsla(0,100%, 50%, 1); background-image: url(sprites/elements.png); background-position: 0 0; }',
      getTestOptions(),
      done
    );
  });
});