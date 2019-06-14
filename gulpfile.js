const gulp = require('gulp');
const postcss = require('gulp-postcss');
const easysprite = require('./index.js');
const rename = require('gulp-rename');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');

gulp.task('project:basic', function(done) {
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

gulp.task('linting', function() {
  return gulp.src('./index.js').pipe(eslint()); // hint (optional)
});

gulp.task('runtest', function() {
  return gulp.src('test/basic.js', { read: false }).pipe(mocha());
});

gulp.task('test', gulp.series('project:basic', 'linting'), function() {
  return gulp.src('test/*.js', { read: false }).pipe(mocha());
});

gulp.task('watch', function(done) {
  gulp.watch(['test/basic/input.css'], ['project:basic']);

  done();
});

gulp.task('project', gulp.series('project:basic'));
gulp.task('test', gulp.series('linting', 'runtest'));
gulp.task('default', gulp.series('watch'));
