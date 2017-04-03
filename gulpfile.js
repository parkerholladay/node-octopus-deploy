'use strict'

var gulp = require('gulp-help')(require('gulp'))
var jshint = require('gulp-jshint')
var cached = require('gulp-cached')

var jsFiles = ['bin/**/*.js', 'lib/**/*.js', 'test/**/*.js']

gulp.task('default', 'Lint and Test server side js', ['lint'])

gulp.task('lint', 'Lints all server side js', () => {
  return gulp.src(jsFiles)
    .pipe(cached('jsFiles'))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
})
