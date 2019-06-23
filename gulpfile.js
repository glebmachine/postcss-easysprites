const { task, src, dest, series } = require('gulp');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const del = require('del');
const easysprite = require('./index.js');

task('clean:demo', (done) => {
  del(['./test/demo/sprites/**']);
  done();
});

task('runDemo', (done) => {
  src('./test/fixtures/input.css')
    .pipe(
      postcss([
        easysprite({
          imagePath: './test/demo/images',
          spritePath: './test/demo/sprites',
        }),
      ])
    )
    .pipe(rename('output.css'))
    .pipe(dest('./test/demo/'));

  done();
});

task('linting', () => {
  return src('**/*.js').pipe(eslint()); // hint (optional)
});

task('runTest', () => {
  return src('test/*.test.js', { read: false }).pipe(mocha());
});

// task('project', series('project:basic'));
task('demo', series('clean:demo', 'runDemo'));
task('test', series('linting', 'runTest'));
task('default', series('test'));
