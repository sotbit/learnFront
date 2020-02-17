"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const server = require("browser-sync").create();
const imagemin = require("gulp-imagemin");
const svgstore = require("gulp-svgstore");
const rename = require("gulp-rename");
const run = require("run-sequence");
const del = require("del");
const cheerio = require("gulp-cheerio");
const replace = require("gulp-replace");
const webp = require("gulp-webp");
const minjs = require("gulp-minify");


gulp.task("clean", function () {
    return del("build");
});

gulp.task('style', function () {
    return gulp.src('source/scss/style.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([autoprefixer({
            grid: 'autoplace',
            overrideBrowserslist: ['last 2 versions', 'Firefox > 20']
        })]))
        .pipe(gulp.dest('build/css'))
});

gulp.task("images", function () {
    return gulp.src("source/img/**/*.{png,jpg,svg}")
        .pipe(imagemin([
            imagemin.mozjpeg({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 3 }),
            imagemin.svgo()
        ]))
        .pipe(gulp.dest("build/img"));
});

gulp.task("webp", function () {
    return gulp.src("source/img/*.{png,jpg}")
        .pipe(webp({ quality: 90 }))
        .pipe(gulp.dest("build/img"))
});

gulp.task("sprite", function () {
    return gulp.src("source/img/sprite/*.svg")
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {
                xmlMode: true
            }
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(rename("sprite.svg"))
        .pipe(gulp.dest("build/img"));
});

gulp.task("minify", function () {
    return gulp.src("source/js/*.js")
        .pipe(minjs())
        .pipe(gulp.dest("build/js"))
});

gulp.task("copyfonts", function () {
    return gulp.src("source/fonts/**/*.{woff,woff2}", {
            base: "source"
    })
        .pipe(gulp.dest("build"))
});


gulp.task("copyhtml", function () {
    return gulp.src("source/*.html")
        .pipe(gulp.dest("build/"))
});




gulp.task('build', gulp.series(
    "clean",
    "style",
    "images",
    "sprite",
    "webp",
    "copyfonts",
    "copyhtml",
    "minify",
    "copyhtml",
));

gulp.task("serve", function () {
    server.init({
        server: "build/",
        notify: false,
        open: true,
        cors: true,
        ui: false
    });

    gulp.watch(["source/scss/**/*.scss"], gulp.parallel(["style"]));
    gulp.watch(["source/*.html"], gulp.parallel(["copyhtml"]));
    gulp.watch("source/*.html").on("change", server.reload);
    gulp.watch(["source/js/*.js"], gulp.parallel(["minify"]));

});