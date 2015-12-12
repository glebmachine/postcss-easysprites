'use strict';

var gulp = require('gulp');
var postcss = require('gulp-postcss');
var easysprite = require('./index.js');
var rename = require('gulp-rename');

// linting
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var stylish = require('gulp-jscs-stylish');

gulp.task('test', ['project:basic', 'lint'], function() {
  var mocha = require('gulp-mocha');
  return gulp.src('test/*.js', { read: false })
    .pipe(mocha());
});

gulp.task('project:basic', function() {

  gulp.src('./test/basic/input.css')
    .pipe(postcss([
        easysprite({
          imagePath:'./test/basic/images',
          spritePath: './test/basic/sprites',
        }),
      ]))
      .pipe(rename('output.css'))
      .pipe(gulp.dest('./test/basic/'));
});

gulp.task('linting', function() {
  return gulp.src('./index.js')
    .pipe(jshint())                           // hint (optional)
    .pipe(jscs())                             // enforce style guide
    .pipe(stylish.combineWithHintResults())   // combine with jshint results
    .pipe(jshint.reporter('jshint-stylish')); // use any jshint reporter to log hint
});


gulp.task('watch', function() {
  gulp.watch([
    'test/basic/input.css',
  ], ['project:basic']);
});

gulp.task('project', ['project:basic']);
gulp.task('default', ['watch']);
gulp.task('test', ['linting']);
