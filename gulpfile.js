var gulp     = require('gulp'),
sourcemaps   = require('gulp-sourcemaps'),
livereload   = require('gulp-livereload'),
babel        = require('gulp-babel'),
concat       = require('gulp-concat'),
cleanCSS     = require('gulp-clean-css'),
gulpFilter   = require('gulp-filter'),
imagemin     = require('gulp-imagemin'),
inject       = require('gulp-inject'),
less         = require('gulp-less'),
uglify       = require('gulp-uglify'),
plumber      = require('gulp-plumber'),
print        = require('gulp-print'),
rename       = require('gulp-rename'),
data         = require('gulp-data'),
gchbs        = require('gulp-compile-handlebars'),
browserSync  = require('browser-sync').create(),
browserify   = require('browserify'),
babelify     = require('babelify'),
sourcestream = require('vinyl-source-stream'),
buffer       = require('vinyl-buffer'),
del          = require('del'),
runSequence  = require('run-sequence'),
args         = require('yargs').argv;

// Set constants
// --------------------------------
let browserRun = args.run == 0 ? false : true;
let config = require('./config');
let source = config.source;
let dest = config.dest;


// Serve tasks
// --------------------------------
gulp.task('default', ['serve']);

gulp.task('serve', ['clean'], function(){
    let build = [
        'serve:css',
        'serve:js_vendors',
        'serve:js_app',
        'serve:img',
        'serve:font',
        'serve:html',
    ];
    let runWatch = (!browserRun) ? [] : [
        'browser-sync',
        'serve:watch'
    ];
    runSequence(
        build,
        ...runWatch
    );
});

gulp.task('serve:css', function(){
  return gulp.src(source.css)
   .pipe(plumber())
   .pipe(print(function( filepath ){
     console.log('FILE LESS: ' + filepath);
   }))
   .pipe(concat('style.less'))
   .pipe(less())
   .pipe(gulp.dest(dest.css))
   .pipe(browserSync.stream());
});

gulp.task('serve:js_vendors', function () {
  return gulp.src(source.js_vendors)
    .pipe(sourcemaps.init())
    .pipe(concat('vendors.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest.js));
});

gulp.task('serve:js_app', function() {
  return browserify({ entries: source.js, debug: true })
    .transform('babelify')
    .bundle()
    .on('error', function(error) {
      console.log("[Bundle Error] " + error);
    })
    .pipe(sourcestream('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest.js))
});

gulp.task('serve:img', function(){
  return gulp.src(source.img)
   .pipe(plumber())
   .pipe(gulp.dest(dest.img));

});

gulp.task('serve:font', function(){
  return gulp.src(source.font)
   .pipe(plumber())
   .pipe(gulp.dest(dest.font));

});

gulp.task('serve:html', function () {
    let strings = require(source.strings);
    let helpers = require(source.helpers);
    options = {
        batch : source.partials,
        helpers: helpers.commonFunctions,
    };

    return gulp.src(source.template)
        .pipe(data(function(file) {
            return require(source.strings);
        }))
        .pipe(gchbs(strings, options))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./'));
});

gulp.task('clean', function() {
    let destFolders = [
        dest.css,
        dest.js,
        dest.img,
        dest.font,
    ];
    return del(destFolders, {
        force: true
    });
});


// Watch tasks
// --------------------------------
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        },
        open: true,
        notify: false
    });
});

gulp.task('serve:watch', function() {
    gulp.watch( source.css , ['watch:css'] );
    gulp.watch( source.js , ['watch:js_app'] );
});
gulp.task('watch:css' , [ 'serve:css' ], BSReload);
gulp.task('watch:js_app', [ 'serve:js_app' ], BSReload);

var BSReload = function() {
    browserSync.reload();
};
