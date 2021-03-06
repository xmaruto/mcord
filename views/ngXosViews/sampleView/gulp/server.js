'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var inject = require('gulp-inject');
var es = require('event-stream');
var runSequence = require('run-sequence');
var angularFilesort = require('gulp-angular-filesort');
var babel = require('gulp-babel');
var wiredep = require('wiredep').stream;
var httpProxy = require('http-proxy');
var del = require('del');
var sass = require('gulp-sass');
var debug = require('gulp-debug');

const environment = process.env.NODE_ENV;

if (environment){
  var conf = require(`../env/${environment}.js`);
}
else{
  var conf = require('../env/default.js')
}

var proxy = httpProxy.createProxyServer({
  target: conf.host || 'http://0.0.0.0:9999'
});


proxy.on('error', function(error, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  console.error('[Proxy]', error);
});

module.exports = function(options){
  // open in browser with sync and proxy to 0.0.0.0
  gulp.task('browser', function() {
    console.log(options.helpers);
    browserSync.init({
      // reloadDelay: 500,
      // logLevel: 'debug',
      // logConnections: true,
      startPath: '#/',
      snippetOptions: {
        rule: {
          match: /<!-- browserSync -->/i
        }
      },
      server: {
        baseDir: options.src,
        routes: {
          // '/xosHelpers/src': options.helpers,
          '/xos/core/xoslib/static/js/vendor': options.helpers
        },
        middleware: function(req, res, next){
          if(
            // req.url.indexOf('/xos/') !== -1 ||
            // req.url.indexOf('/xoslib/') !== -1 ||
            // req.url.indexOf('/hpcapi/') !== -1 ||
            req.url.indexOf('/api/') !== -1
          ){
            if(conf.xoscsrftoken && conf.xossessionid){
              req.headers.cookie = `xoscsrftoken=${conf.xoscsrftoken}; xossessionid=${conf.xossessionid}`;
              req.headers['x-csrftoken'] = conf.xoscsrftoken;
            }
            proxy.web(req, res);
          }
          else{
            next();
          }
        }
      }
    });

    gulp.watch(options.src + 'js/**/*.js', ['js-watch']);
    gulp.watch(options.src + 'vendor/**/*.js', ['bower'], function(){
      browserSync.reload();
    });
    gulp.watch(options.src + '**/*.html', function(){
      browserSync.reload();
    });
    gulp.watch(options.css + '**/*.css', function(){
      browserSync.reload();
    });

    gulp.watch(options.helpers + 'ngXosHelpers.js', function(){
      browserSync.reload();
    });
    
    gulp.watch(`${options.sass}/**/*.scss`, ['sass'], function(){
      browserSync.reload();
    });
  });

  // compile sass
  gulp.task('sass', function () {
    return gulp.src(`${options.sass}/**/*.scss`)
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest(options.css));
  });

  // transpile js with sourceMaps
  gulp.task('babel', function(){
    return gulp.src(options.scripts + '**/*.js')
      .pipe(babel({sourceMaps: true}))
      .pipe(gulp.dest(options.tmp));
  });

  // // inject sourceMap
  // gulp.task('injectMaps', function(){
  //   return gulp.src(options.src + 'index.html')
  //     .pipe(
  //       inject(
  //         gulp.src([
  //           options.helpersSourceMaps + '**/*.js.map'
  //         ], {read: false}).pipe(debug()),
  //         {
  //           starttag: '<!-- inject:maps -->',
  //           // ignorePath: [options.src, '/../../ngXosLib']
  //         }
  //       )
  //     )
  //     .pipe(gulp.dest(options.src));
  // });

  // inject scripts
  gulp.task('injectScript', ['cleanTmp', 'babel'], function(){

    var appScripts = gulp.src([
      options.tmp + '**/*.js',
      options.helpers + 'ngXosHelpers.js'
    ])
    .pipe(angularFilesort()).pipe(debug());

    var helpersSourceMaps = gulp.src([
      options.helpersSourceMaps + '**/*.js.map'
    ]).pipe(debug());

    return gulp.src(options.src + 'index.html')
      .pipe(
        inject(
          es.merge(appScripts, helpersSourceMaps),
          {
            ignorePath: [options.src, '/../../ngXosLib']
          }
        )
      )
      .pipe(gulp.dest(options.src));
  });

  // inject CSS
  gulp.task('injectCss', function(){
    return gulp.src(options.src + 'index.html')
      .pipe(
        inject(
          gulp.src(options.src + 'css/*.css'),
          {
            ignorePath: [options.src]
          }
          )
        )
      .pipe(gulp.dest(options.src));
  });

  // inject bower dependencies with wiredep
  gulp.task('bower', function () {
    return gulp.src(options.src + 'index.html')
    .pipe(wiredep({devDependencies: true}))
    .pipe(gulp.dest(options.src));
  });

  gulp.task('js-watch', ['injectScript'], function(){
    browserSync.reload();
  });

  gulp.task('cleanTmp', function(){
    return del([options.tmp + '**/*']);
  });

  gulp.task('serve', function() {
    runSequence(
      'sass',
      'bower',
      'injectScript',
      'injectCss',
      ['browser']
    );
  });
};
