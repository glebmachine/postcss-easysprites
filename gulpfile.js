'use strict';

var gulp = require('gulp');
var postcss = require('gulp-postcss');
var easysprite = require('./index.js');
var rename = require('gulp-rename');
var eslint = require('gulp-eslint');

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
  var mocha = require('gulp-mocha');

  return gulp.src('test/basic.js', { read: false }).pipe(mocha());
});

gulp.task('test', gulp.series('project:basic', 'linting'), function() {
  var mocha = require('gulp-mocha');
  return gulp.src('test/*.js', { read: false }).pipe(mocha());
});

gulp.task('watch', function(done) {
  gulp.watch(['test/basic/input.css'], ['project:basic']);

  done();
});

gulp.task('project', gulp.series('project:basic'));
gulp.task('test', gulp.series('linting', 'runtest'));
gulp.task('default', gulp.series('watch'));
