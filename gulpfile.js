'use strict';

var gulp = require('gulp');
var postcss = require('gulp-postcss');
var easysprite = require('./index.js');
var rename = require('gulp-rename');
var eslint = require('gulp-eslint');

gulp.task('test', ['project:basic', 'lint'], function() {
    var mocha = require('gulp-mocha');
    return gulp.src('test/*.js', { read: false })
      .pipe(mocha());
});

gulp.task('project:basic', function(){

    gulp.src('./test/basic/input.css')
      .pipe(postcss([
        easysprite({
          imagePath:'./test/basic/images', 
          spritePath: './test/basic/sprites'
        })
      ]))
      .pipe(rename('output.css'))
      .pipe(gulp.dest('./test/basic/'));
});


gulp.task('lint', function () {
    return gulp.src(['index.js'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});

gulp.task('project', ['project:basic']);
gulp.task('default', ['watch']);

gulp.task('watch', function() {
    gulp.watch([
      'test/basic/input.css',
    ], ['project:basic']);
});
