const gulp = require('gulp');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const easysprite = require('./index.js');

gulp.task('project:basic', (done) => {
  gulp
    .src('./test/basic/input.css')
    .pipe(
      postcss([
        easysprite({
          imagePath: './test/basic/images',
          spritePath: './test/basic/sprites',
        }),
      ])
    )
    .pipe(rename('output.css'))
    .pipe(gulp.dest('./test/basic/'));

  done();
});

gulp.task('linting', () => {
  return gulp.src('./index.js').pipe(eslint()); // hint (optional)
});

gulp.task('runtest', () => {
  return gulp.src('test/basic.js', { read: false }).pipe(mocha());
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
