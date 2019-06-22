const gulp = require('gulp');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const del = require('del');
const easysprite = require('./index.js');

gulp.task('project:basic', (done) => {
  gulp
    .src('./test/demo/input.css')
    .pipe(
      postcss([
        easysprite({
          imagePath: './test/demo/images',
          spritePath: './test/demo/sprites',
        }),
      ])
    )
    .pipe(rename('output.css'))
    .pipe(gulp.dest('./test/demo/'));

  done();
});

gulp.task('clean:demo', (done) => {
  del(['./test/demo/sprites/**']);
  done();
});

gulp.task('runDemo', (done) => {
  gulp
    .src('./test/demo/input.css')
    .pipe(
      postcss([
        easysprite({
          imagePath: './test/demo/images',
          spritePath: './test/demo/sprites',
        }),
      ])
    )
    .pipe(rename('output.css'))
    .pipe(gulp.dest('./test/demo/'));

  done();
});

gulp.task('demo', gulp.series('clean:demo', 'runDemo'));

gulp.task('linting', () => {
  return gulp.src('./index.js').pipe(eslint()); // hint (optional)
});

gulp.task('runtest', () => {
  return gulp.src('test/*.test.js', { read: false }).pipe(mocha());
});

gulp.task('test', gulp.series('project:basic', 'linting'), () => {
  return gulp.src('test/*.js', { read: false }).pipe(mocha());
});

gulp.task('watch', (done) => {
  gulp.watch(['test/basic/input.css'], ['project:basic']);

  done();
});

gulp.task('project', gulp.series('project:basic'));
gulp.task('test', gulp.series('linting', 'runtest'));
gulp.task('default', gulp.series('watch'));
