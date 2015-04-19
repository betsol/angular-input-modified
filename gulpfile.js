//==============//
// DEPENDENCIES //
//==============//

var del = require('del');
var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var deploy = require('gulp-gh-pages');
var debug = require('gulp-debug');
var serverFactory = require('spa-server');
var ngAnnotate = require('gulp-ng-annotate');
var angularProtractor = require('gulp-angular-protractor');
var runSequence = require('run-sequence');
var concat = require('gulp-concat');

//=========//
// GLOBALS //
//=========//

var demoServer;


//=======//
// CLEAN //
//=======//

gulp.task('clean', function (callback) {
  del(['dist'], callback);
});


//=======//
// BUILD //
//=======//

gulp.task('build', ['clean'], function () {
  gulp
    .src([
      // This file contains module registration and therefore should go first.
      './src/directive/bsModifiable.js',
      './src/inputModifiedConfig.js',
      './src/directive/form.js',
      './src/directive/ngModel.js'
    ])
    .pipe(concat('angular-input-modified.js'))
    .pipe(gulp.dest('dist'))
    .pipe(ngAnnotate({
      'single_quotes': true
    }))
    .pipe(uglify())
    .pipe(rename('angular-input-modified.min.js'))
    .pipe(gulp.dest('dist'))
    .on('error', gutil.log)
  ;
});


//===========//
// WEBSERVER //
//===========//

gulp.task('webserver.start', function (callback) {
  demoServer = serverFactory.create({
    path: './demos',
    port: 8888,
    serveStaticConfig: {
      index: 'index.html'
    }
  });
  demoServer.start(callback);
});

gulp.task('webserver.stop', function (callback) {
  demoServer.stop(callback);
});


//=======//
// DEMOS //
//=======//

gulp.task('demo', ['webserver.start']);

gulp.task('demo-deploy', function () {
  return gulp.src('./demos/**/*.*')
    .pipe(debug({
      title: 'Deploy'
    }))
    .pipe(deploy());
});


//=======//
// TESTS //
//=======//

gulp.task('test', function (callback) {
  // Starting web-server, then running end-to-end tests on it.
  runSequence('webserver.start', 'test-e2e', 'webserver.stop', callback);
});


//------------//
// TESTS: E2E //
//------------//

gulp.task('test-e2e', function () {
  return gulp.src(['./tests/e2e/spec.js'])
    .pipe(angularProtractor({
      configFile: './tests/e2e/conf.js',
      args: ['--baseUrl', 'http://localhost:8888'],
      autoStartStopServer: true,
      debug: true
    }))
    .on('error', function (error) {
      throw error;
    })
  ;
});


//==============//
// DEFAULT TASK //
//==============//

gulp.task('default', ['build']);
