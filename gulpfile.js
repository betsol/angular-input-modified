var del     = require('del');
var gulp    = require('gulp');
var rename  = require('gulp-rename');
var uglify  = require('gulp-uglify');
var gutil   = require('gulp-util');
var deploy  = require('gulp-gh-pages');
var debug   = require('gulp-debug');
var connect = require('gulp-connect');

gulp.task('clean', function (callback) {
    del(['dist'], callback);
});

gulp.task('build', ['clean'], function () {
    gulp.src('src/angular-input-modified.js')
        .pipe(rename('angular-input-modified.js'))
        .pipe(gulp.dest('dist'))
        .pipe(uglify())
        .pipe(rename('angular-input-modified.min.js'))
        .pipe(gulp.dest('dist'))
        .on('error', gutil.log)
    ;
});

gulp.task('deploy', function () {
    return gulp.src('./demos/**/*.*')
        .pipe(debug({
            title: 'Deploy'
        }))
        .pipe(deploy({}));
});

gulp.task('webserver', function() {
    connect.server({
        root: './demos',
        port: 8888
    });
});

gulp.task('default', ['build']);
