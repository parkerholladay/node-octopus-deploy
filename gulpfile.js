'use strict';

var gulp = require('gulp-help')(require('gulp'));
var jshint = require('gulp-jshint');
var watch = require('gulp-watch');
var cached = require('gulp-cached');
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');

// file specs for collections of files to operate on
var jsFiles = ['lib/**/*.js', 'test/**/*.js'];
var jsMochaTestFiles = ['test/**/*.js'];

// Single run of all tasks with report generation
gulp.task('default', 'Lint and Test server side js', ['lint', 'test']);

gulp.task('dev', 'TDD runner for lint, test of lib', ['lint', 'test-tdd'], function () {
	gulp.watch(jsFiles, ['lint']);
	gulp.watch(jsFiles, ['test-tdd']);
});

gulp.task('test-tdd', 'Runs the tests for lib', function () {
	return gulp.src(jsMochaTestFiles)
		.pipe(mocha({reporter: 'dot'}));
});

gulp.task('test', 'Runs the tests for lib', function () {
	return gulp.src(jsMochaTestFiles)
		.pipe(cover.instrument({
			pattern: jsMochaTestFiles,
			debugDirectory: './dist/coverage/mocha-debug'
		}))
		.pipe(mocha({reporter: 'dot'}))
		.on('error', function (err) {
			console.log(err.toString());
			process.exit(1);
		})
		.pipe(cover.report({
			'reporter': 'html',
			outFile: './dist/coverage/mocha-unit.html'
		}))
		.once('error', function () {
			process.exit(1);
		})
		.once('end', function () {
			process.exit();
		});
});

// lint
gulp.task('lint', 'Lints all server side js', function () {
	return gulp.src(jsFiles)
		.pipe(cached('jsFiles'))
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});