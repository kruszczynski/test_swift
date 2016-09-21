var gulp = require('gulp');

var autoprefixer = require('gulp-autoprefixer');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sass = require('gulp-ruby-sass');
var sourcemaps = require('gulp-sourcemaps');
var util = require('gulp-util');
var templateCache = require('gulp-angular-templatecache');
var htmlify = require('gulp-angular-htmlify');
var jade = require('gulp-jade');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var connect = require('gulp-connect');
var cleanCSS = require('gulp-clean-css');

var bowerDir = './vendor/components';
var styleDir = './app/stylesheets';
var srcDir = './app/javascript/';
var destDir = './dist/';

var paths = {
    vendorJs: [
        bowerDir + '/jquery/dist/jquery.js',
        bowerDir + '/ace-builds/src-noconflict/ace.js',
        bowerDir + '/angular/angular.js',
        bowerDir + '/ui-router/release/angular-ui-router.js',
        bowerDir + '/angular-ui-ace/ui-ace.js',
        bowerDir + '/ace-builds/src-noconflict/mode-ruby.js',
        bowerDir + '/ace-builds/src-noconflict/mode-golang.js',
        bowerDir + '/ace-builds/src-noconflict/mode-swift.js',
        bowerDir + '/ace-builds/src-noconflict/mode-python.js',
    ],
    fonts: [
        styleDir + '/fonts/fontello/fontello.*'
    ]
};

var config = {
    sass: {
        src: [styleDir + '/main.scss'],
        watchSrc: [styleDir + '/**/*.scss'],
        options: {
            sourcemap: true,
            lineNumbers: true
        }
    },
    coffee: {
        src: [srcDir + '**/*.coffee'],
        watchSrc: [srcDir + '/**/*.coffee'],
        options: {}
    },
    templates: {
        src: [srcDir + '/**/*.jade'],
        watchSrc: [srcDir + '/**/*.jade'],
        options: {
            basedir: 'app/'
        }
    },
    index: {
        src: ['./app/index.jade'],
        watchSrc: ['./app/index.jade'],
        options: {}
    }
};

/*
 *        SASS
 */

gulp.task('build-sass', function() {
    sass(config.sass.src, config.sass.options)
        .pipe(autoprefixer('last 3 version'))
        .pipe(plumber())
        .pipe(rename('application.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(destDir + '/css/'))
        .pipe(connect.reload());
});

gulp.task('prod-sass', function() {
    sass(config.sass.src, {})
        .pipe(autoprefixer('last 3 version'))
        .pipe(plumber())
        .pipe(rename('application.css'))
        .pipe(cleanCSS({}))
        .pipe(gulp.dest(destDir + '/css/'))
});

gulp.task('watch-sass', function() {
    gulp.watch(config.sass.watchSrc, ['build-sass']);
});

gulp.task('sass', ['build-sass', 'watch-sass']);

/*
 *        Fonts
 */

gulp.task('build-fonts', function() {
    gulp.src(paths.fonts)
        .pipe(gulp.dest(destDir + '/fonts/'))
});

/*
 *         JavaScript
 */

gulp.task('vendor-js', function() {
    gulp.src(paths.vendorJs, { base: 'vendor' })
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.js'))
        //.pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(destDir + '/js/'));
});

gulp.task('build-js', function () {
    gulp.src(config.coffee.src, { base: 'javascript' })
        .pipe(plumber())
        .pipe(sourcemaps.init({debug: true}))
        .pipe(coffee(config.coffee.options))
        .pipe(concat('app.js'))
        .pipe(ngAnnotate({
            add: true,
            map: true
        }))
        //.pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(destDir + '/js/'))
        .pipe(connect.reload());
});

gulp.task('watch-js', function() {
    gulp.watch(config.coffee.watchSrc, ['build-js']);
});

gulp.task('js', ['build-js', 'watch-js']);

/*
 *         Templates
 */

gulp.task('build-templates', function(){
    gulp.src(config.templates.src)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(jade(config.templates.options))
        .pipe(htmlify())
        .pipe(templateCache({
            standalone: true
        }))
        .pipe(concat('templates.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(destDir + '/js/'))
        .pipe(connect.reload());
});

gulp.task('watch-templates', function() {
    gulp.watch(config.templates.watchSrc, ['build-templates']);
});

gulp.task('templates', ['build-templates', 'watch-templates']);

/*
 *          PROD JS
 */

gulp.task('prod-js', function(){
    gulp.src(paths.vendorJs, { base: 'vendor' })
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(gulp.dest(destDir + '/js/'));

    gulp.src(config.templates.src)
        // .pipe(plumber())
        .pipe(jade(config.templates.options))
        .pipe(htmlify())
        .pipe(templateCache({standalone: true}))
        .pipe(concat('templates.js'))
        .pipe(gulp.dest(destDir + '/js/'));

    gulp.src(config.coffee.src, { base: 'javascript' })
        // .pipe(plumber())
        .pipe(coffee(config.coffee.options))
        .pipe(concat('app.js'))
        .pipe(ngAnnotate({add: true}))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest(destDir + '/js/'));

});

/*
 *          index
 */

gulp.task('build-index', function(){
    gulp.src(config.index.src)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(jade(config.index.options))
        .pipe(htmlify())
        .pipe(concat('index.html'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(destDir))
        .pipe(connect.reload());
});


gulp.task('prod-index', function(){
    gulp.src(config.index.src)
        .pipe(plumber())
        .pipe(jade(config.index.options))
        .pipe(htmlify())
        .pipe(concat('index.html'))
        .pipe(gulp.dest(destDir));
});


gulp.task('watch-index', function() {
    gulp.watch(config.index.watchSrc, ['build-index']);
});

gulp.task('index', ['build-index', 'watch-index']);

/*
 *          Server
 */
gulp.task('start', function() {
    connect.server({
        root: 'dist',
        livereload: true,
        fallback: './dist/index.html'
    });
});

/*
 *          Default
 */

gulp.task('watch', ['watch-js', 'watch-templates', 'watch-sass', 'watch-index', 'start']);

gulp.task('default', ['vendor-js', 'build-sass', 'build-js', 'build-templates', 'build-index', 'build-fonts']);

gulp.task('production', ['prod-sass', 'prod-js', 'prod-index', 'build-fonts']);
