'use strict';

const {
    src,
    dest,
    watch,
    parallel,
    series
} = require('gulp');
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const del = require('del');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');
const fileinclude = require('gulp-file-include');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');


function browsersync() {
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
};


function styles() {
    return gulp.src('app/scss/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.stream())
};


function scripts() {
    return gulp.src([
            'node_modules/jquery/dist/jquery.js',
            'app/js/main.js'
        ])
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest('app/js'))
        .pipe(browserSync.stream())
}


function images() {
    return gulp.src('app/images/**/*.*')
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.mozjpeg({
                quality: 75,
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{
                        removeViewBox: true
                    },
                    {
                        cleanupIDs: false
                    }
                ]
            })
        ]))
        .pipe(gulp.dest('dist/images'))
}


function svgSprites() {
    return gulp.src('app/images/icons/*.svg')
        .pipe(cheerio({
            run: ($) => {
                $("[fill]").removeAttr("fill");
                $("[stroke]").removeAttr("stroke");
                $("[style]").removeAttr("style");
            },
            parserOptions: {
                xmlMode: true
            },
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(
            svgSprite({
                mode: {
                    stack: {
                        sprite: '../sprite.svg',
                    },
                },
            })
        )
        .pipe(gulp.dest('app/images'));
}


const htmlInclude = () => {
    return gulp.src(['app/html/*.html'])
        .pipe(fileinclude({
            prefix: '@',
            basepath: '@file',
        }))
        .pipe(gulp.dest('app'))
        .pipe(browserSync.stream());
}


function build() {
    return src([
            'app/**/*.html',
            'app/css/style.css',
            'app/js/main.min.js',
            'app/fonts/**/*',
            'app/images/icons/*.svg',
            'app/images/**/*',
        ], {
            base: 'app'
        })
        .pipe(dest('dist'))
}

function watching() {
    gulp.watch(['app/scss/**/*.scss'], styles);
    gulp.watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    gulp.watch(['app/images/icons/*.svg'], svgSprites);
    gulp.watch(['app/html/**/*.html'], htmlInclude);
    gulp.watch("app/**/*.html").on('change', browserSync.reload);
}


function cleandist() {
    return del('dist')
}


exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.browsersync = browsersync;
exports.images = images;
exports.svgSprites = svgSprites;
exports.cleandist = cleandist;
exports.htmlInclude = htmlInclude;
exports.build = series(cleandist, images, build);
exports.default = parallel(htmlInclude, svgSprites, styles, scripts, browsersync, watching);