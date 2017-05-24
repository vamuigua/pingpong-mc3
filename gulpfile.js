//All variables to the depndancies
var jshint = require('gulp-jshint');
var del = require('del');
var utilities = require('gulp-util');
var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var lib = require('bower-files')({
  "overrides": {
    "bootstrap": {
      "main": [
        "less/bootstrap.less",
        "dist/css/bootstrap.css",
        "dist/js/bootstrap.js"
      ]
    }
  }
});
var buildProduction = utilities.env.production;

//jsBrowserify task
gulp.task('jsBrowserify', function() {
  return browserify({
      entries: ['./js/pingpong-interface.js']
    })
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('./build/js'));
});

//concatInterface task
gulp.task('concatInterface', function() {
  return gulp.src(['./js/*-interface.js'])
    .pipe(concat('allConcat.js'))
    .pipe(gulp.dest('./tmp'));
});

//jsBrowserify task when concatInterface as depndancy
gulp.task('jsBrowserify', ['concatInterface'], function() {
  return browserify({
      entries: ['./tmp/allConcat.js']
    })
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('./build/js'));
});

//minifyScripts task
gulp.task("minifyScripts", ["jsBrowserify"], function() {
  return gulp.src("./build/js/app.js")
    .pipe(uglify())
    .pipe(gulp.dest("./build/js"));
});

//clean task
gulp.task("clean", function() {
  return del(['build', 'tmp']);
});

gulp.task("build", function() {
  if (buildProduction) {
    gulp.start('minifyScripts');
  } else {
    gulp.start('jsBrowserify');
  }
});

//build task
gulp.task("build", ['clean'], function() {
  if (buildProduction) {
    gulp.start('minifyScripts');
  } else {
    gulp.start('jsBrowserify');
  }
  gulp.start('bower');
  gulp.start('cssBuild');
});

//jshint task
gulp.task('jshint', function() {
  return gulp.src(['js/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

//bowerJS task
gulp.task('bowerJS', function() {
  return gulp.src(lib.ext('js').files)
    .pipe(concat('vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'));
});

//bowerCSS task
gulp.task('bowerCSS', function() {
  return gulp.src(lib.ext('css').files)
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('./build/css'));
});

//bower task
gulp.task('bower', ['bowerJS', 'bowerCSS']);

//Task to start the server
gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: "./",
      index: "index.html"
    }
  });
  //Task to watch for changes in the *js files
  gulp.watch(['js/*.js'], ['jsBuild']);
  //Task to watch for changes in bower.json and browser reloads with bowerBuild task
  gulp.watch(['bower.json'], ['bowerBuild']);
  //Task to watch the HTML files
  gulp.watch(['*.html'], ['htmlBuild']);
  //Task to watch the SCSS files
  gulp.watch(["scss/*.scss"], ['cssBuild']);
});

//Task to build and reload the *js files
gulp.task('jsBuild', ['jsBrowserify', 'jshint'], function() {
  browserSync.reload();
});

//bowerBuild task
gulp.task('bowerBuild', ['bower'], function(){
  browserSync.reload();
});

//HTML build task
gulp.task('htmlBuild', function() {
  browserSync.reload();
});

//cssBuild task
gulp.task('cssBuild', function() {
  return gulp.src(['scss/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build/css'))
    .pipe(browserSync.stream());
});
