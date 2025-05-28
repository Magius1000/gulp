/**
 * Команды:
 * gulp --init  (или npm run init)    - Удаляет все ранее созданные билды и создает только dev для дальнейшей разработки и все необходимые каталоги в src
 * gulp         (или npm run dev)     - Запускает проект для локальной разработки на 3000 порту
 * gulp --dist  (или npm run dist)    - Собирает проект в каталоге dist с оптимизированными картинками скриптами и стилями но без минификации вайлов ля дальнейшей работы с версткой. + Создает zip архив
 * gulp --build (или npm run build)   - Собирает проект в каталоге build с оптимизированными картинками и минифицированными скриптами и стилями. + Создает zip архив
 * gulp clear   (или npm run clear)   - Удаляет все ранее созданные билды и каталог dev
 */

import config from './gulpConfig.js';
import fs from 'fs';
import gulp from 'gulp';
import browserSync from 'browser-sync';
import sourcemaps from 'gulp-sourcemaps';
import filter from 'gulp-filter';
import beautify from 'gulp-beautify';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import { deleteAsync } from 'del';
import Yargs from 'yargs';
import gulpif from 'gulp-if';
import revReplace from 'gulp-rev-replace';
import rev from 'gulp-rev';
import zip from 'gulp-zip';

// css
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import sassLint from 'gulp-sass-lint';
import cleanCss from 'gulp-clean-css';
import autoprefixer from 'gulp-autoprefixer';
import webpCss from 'gulp-webp-css';

// js
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import ESLintPlugin from 'eslint-webpack-plugin';
import path from 'path';

// html
import htmlhint from 'gulp-htmlhint';
import panini from 'panini';
import webpHtml from 'gulp-webp-html-nosvg';

// img
import newer from 'gulp-newer';
import webp from 'gulp-webp';
import svgSprite from 'gulp-svg-sprite';
import imagemin from 'gulp-imagemin';
import spritesmith from 'gulp.spritesmith';

const sass = gulpSass(dartSass);

const args = Yargs(process.argv.slice(2)).argv; // Получаем аргументы:
const { dist } = args; // gulp --dist
const { build } = args; // gulp --build
const { init } = args; // gulp --init
const dev = !dist && !build && !init; // Выбран ли режим разработки

// Определяем каталог вывода
const distFolder = dist ? config.dist : build ? config.build : config.dev;

// Конфигурация webpack зависит от флага команды.
const webpackDevtool = !build ? 'inline-source-map' : false;
const webpackMode = dev || init ? 'development' : 'production';
const webpackMinimize = !!build;
const webpackConfig = {
  mode: webpackMode,
  devtool: webpackDevtool,
  output: {
    filename: 'all.js',
  },
  resolve: {
    alias: {
      process: 'process/browser',
    },
    fallback: {
      http: false,
      https: false,
      crypto: false,
      'crypto-browserify': path.resolve('crypto-browserify'),
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new ESLintPlugin(),
  ],
  optimization: {
    minimize: webpackMinimize,
  },
  performance: {
    hints: false,
  },
};

// путь временного хранилища.
const TEMP_DIR = 'temp';

{
  // Создание каталога для временного хранилища
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
  }

  // Если флаг init, создание необходимых для разработки каталогов
  if (init) {
    config.folders.forEach((folder) => {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
    });
  }

  gulp.task('clear', clearAll, clearTemp);

  gulp.task(
    'sprite',
    gulp.series(spriteGenerate, spriteImageHandler, spriteStyleHandler),
  );

  gulp.task(
    'all',
    gulp.series(
      clear,
      styles,
      scripts,
      'sprite',
      layout,
      images,
      svg,
      fonts,
      resources,
      clearTemp,
    ),
  );

  // Используется только команда по умолчанию, но ее операции зависят от переданного флага --dist, --build, --init
  if (dev) {
    gulp.task('default', gulp.series('all', watch));
  } else if (init) {
    gulp.task('default', gulp.series('all'));
  } else {
    gulp.task('default', gulp.series('all', archive));
  }
}

/** Удаляет каталоги сборки в зависимости от флага/команды */
async function clear() {
  if (dev || dist || build) {
    return await deleteAsync(distFolder.baseDir);
  }
  return await clearAll();
}

/** Удаляет временные файлы */
async function clearTemp() {
  return await deleteAsync(TEMP_DIR);
}

/** Удаляет все каталоги сборки и временные файлы */
async function clearAll() {
  return await Promise.all([
    deleteAsync(config.dev.baseDir),
    deleteAsync(config.dist.baseDir),
    deleteAsync(config.build.baseDir),
  ]);
}

function styles() {
  return gulp
    .src(config.src.sass)
    .pipe(
      // Обработка ошибок
      plumber({
        errorHandler: notify.onError((error) => ({
          title: 'SASS',
          message: error.message,
        })),
      }),
    )
    .pipe(sassLint()) // Линтер
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
    .pipe(gulpif(!build, sourcemaps.init())) // Если не флаг билда - создаем карту ресурсов
    .pipe(sass().on('error', sass.logError)) // Сборка SASS
    .pipe(
      // Добавление префиксов
      autoprefixer({
        overrideBrowserslist: ['last 4 versions'],
        cascade: false,
      }),
    )
    .pipe(webpCss()) // Заена форматов изображений на wep в ссылках (сами картинки тоже будут преобразованы)
    .pipe(gulpif(build, cleanCss({ level: 1 }))) // Если флаг билда - то минифицируем
    .pipe(gulpif(dist || build, rev())) // Если флаг dist или build, добавление хеша к имени файла
    .pipe(gulpif(!build, sourcemaps.write('./'))) // Вывод карты ресурсов
    .pipe(gulp.dest(distFolder.css))
    .pipe(
      // manifest.json нужен для сохранения и передачи нового имени файла с хешем в обработчик html
      gulpif(
        dist || build,
        rev.manifest(distFolder.baseDir + '/manifest.json', {
          base: distFolder.baseDir, // Базовый каталог для manifest.json.
          merge: true, // Чтобы манифесты не перезаписывались, а соединялись в один
        }),
      ),
    )
    .pipe(gulpif(dist || build, gulp.dest(distFolder.baseDir)))
    .pipe(gulpif(dev, browserSync.stream()));
}

function scripts() {
  return gulp
    .src(config.src.js)
    .pipe(
      // Обработка ошибок
      plumber({
        errorHandler: notify.onError((error) => ({
          title: 'JS',
          message: error.message,
        })),
      }),
    )
    .pipe(webpackStream(webpackConfig)) // Сборка JS с webpack
    .pipe(gulpif(dist || build, rev())) // Если флаг dist или build, добавление хеша к имени файла
    .pipe(gulp.dest(distFolder.js))
    .pipe(
      // manifest.json нужен для сохранения и передачи нового имени файла с хешем в обработчик html
      gulpif(
        dist || build,
        rev.manifest(distFolder.baseDir + '/manifest.json', {
          base: distFolder.baseDir, // Базовый каталог для manifest.json. Можно было бы и обойтись без этой опции, но без неё не работает merge
          merge: true, // Чтобы манифесты не перезаписывались, а соединялись в один
        }),
      ),
    )
    .pipe(gulpif(dist || build, gulp.dest(distFolder.baseDir)))
    .pipe(gulpif(dev, browserSync.stream()));
}

function layout() {
  // Достаем manifest.json для получения имен файлов js и css с хешем
  var manifest =
    dist || build ? gulp.src(distFolder.baseDir + '/manifest.json') : '';
  panini.refresh();

  return gulp
    .src(config.src.html)
    .pipe(
      plumber({
        // Обработка ошибок
        errorHandler: notify.onError((error) => ({
          title: 'HTML',
          message: error.message,
        })),
      }),
    )
    .pipe(
      panini({
        // Сборка HTML шаблонизатором
        root: config.src.path + 'pages/',
        layouts: config.src.path + 'layouts/',
        partials: config.src.path + 'partials/',
        helpers: config.src.path + 'helpers/',
        data: config.src.path + 'data/',
      }),
    )
    .pipe(filter(['**', config.src.htmlFilterBlocks])) // Отфильтровываем ненужные файлы
    .pipe(gulpif(dist || build, beautify.html(config.beautifyHtml))) // Если флаги dist или build - минифицируем
    .pipe(htmlhint(config.htmlhintHtml)) // HTML линтер
    .pipe(htmlhint.reporter())
    .pipe(htmlhint.failReporter({ suppress: true }))
    .pipe(webpHtml()) // Заена форматов изображений в ссылках (сами картинки тоже будут преобразованы)
    .pipe(gulpif(dist || build, revReplace({ manifest: manifest })))
    .pipe(gulp.dest(distFolder.html))
    .pipe(gulpif(dev, browserSync.stream()));
}

function images() {
  return gulp
    .src(config.src.img, { encoding: false })
    .pipe(
      plumber({
        // Обработка ошибок
        errorHandler: notify.onError((error) => ({
          title: 'IMAGES',
          message: error.message,
        })),
      }),
    )
    .pipe(newer(config.dev.img)) // Исключает повторную обработку уже обработанных файлов
    .pipe(gulpif(!dev, imagemin())) // Если мы не в режиме разработки - то сжимаем изображения
    .pipe(gulp.dest(distFolder.img)) // Вначале выводим изображений в изначальном формате
    .pipe(webp()) // Преобразование в формат webp
    .pipe(gulp.dest(distFolder.img)) // после выводим преобразованные файлы
    .pipe(gulpif(dev, browserSync.stream()));
}

function svg() {
  return gulp
    .src(config.src.svg)
    .pipe(
      plumber({
        // Обработка ошибок
        errorHandler: notify.onError((error) => ({
          title: 'SVG',
          message: error.message,
        })),
      }),
    )
    .pipe(
      // Пакуем все svg в оптимизированный спрайт
      svgSprite({
        shape: {
          dest: './svg',
        },
        mode: {
          symbol: true,
        },
      }),
    )
    .pipe(gulp.dest(distFolder.svgSprite))
    .pipe(gulpif(dev, browserSync.stream()));
}

function fonts() {
  return gulp // Шрифты просто копируем
    .src(config.src.fonts, { encoding: false })
    .pipe(gulp.dest(distFolder.fonts))
    .pipe(gulpif(dev, browserSync.stream()));
}

function resources() {
  // favicon, json, php и прочие файлы просто копируем
  return gulp
    .src('src/resources/**/*.*')
    .pipe(gulp.dest(distFolder.resources))
    .pipe(gulpif(dev, browserSync.stream()));
}

function archive() {
  return gulp // Архивируем содержимое build или dist в зависимости от флага
    .src(`${distFolder.baseDir}/*`)
    .pipe(zip(build ? 'build.zip' : 'dist.zip'))
    .pipe(gulp.dest(distFolder.baseDir));
}

function spriteGenerate() {
  // Генерация растрового спрайа
  const spriteData = gulp
    .src(config.src.icons, { encoding: false })
    .pipe(spritesmith(config.spritesmithOptopns));

  // Созданный png спрайт и css для него ложим во временный каталог для дальнейшей обработки
  return spriteData.pipe(gulp.dest(TEMP_DIR, { encoding: false }));
}

function spriteImageHandler() {
  // Обработка png спрайта сгенерированного функцией spriteGenerate
  return gulp
    .src(`${TEMP_DIR}/*.png`, { encoding: false }) // достаем из временного каталога
    .pipe(
      plumber({
        // обработка ошибок
        errorHandler: notify.onError((error) => ({
          title: 'SPRITE images',
          message: error.message,
        })),
      }),
    )
    .pipe(gulpif(!dev, imagemin())) // Если мы не в режиме разработки, то сжимаем изображение
    .pipe(gulp.dest(distFolder.img)) // Отправляем в конечный каталог
    .pipe(webp()) // Преобразуем в формат webp
    .pipe(gulp.dest(distFolder.img)); // Webp формат тоже ложим в конечнфый каталог
}

function spriteStyleHandler() {
  // Обработка css для спрайта сгенерированного функцией spriteGenerate
  return gulp
    .src(`${TEMP_DIR}/*.css`) // достаем из временного каталога
    .pipe(
      plumber({
        // Обработка ошибок
        errorHandler: notify.onError((error) => ({
          title: 'SPRITE styles',
          message: error.message,
        })),
      }),
    )
    .pipe(gulpif(!build, sourcemaps.init())) // Если не флаг build - создаем карту ресурсов
    .pipe(
      autoprefixer({
        // Добавляем префиксы
        overrideBrowserslist: ['last 4 versions'],
        cascade: false,
      }),
    )
    .pipe(webpCss()) // Заена формата на wep
    .pipe(gulpif(build, cleanCss({ level: 1 }))) // Если флаг билда - то минифицируем
    .pipe(gulpif(dist || build, rev())) // Если флаг dist или build, добавление хеша к имени файла
    .pipe(gulpif(!build, sourcemaps.write('./'))) // Вывод карты ресурсов
    .pipe(gulp.dest(distFolder.css))
    .pipe(
      // manifest.json нужен для сохранения и передачи нового имени файла с хешем в обработчик html
      gulpif(
        dist || build,
        rev.manifest(distFolder.baseDir + '/manifest.json', {
          base: distFolder.baseDir, // Базовый каталог для manifest.json. Можно было бы и обойтись без этой опции, но без неё не работает merge
          merge: true, // Чтобы манифесты не перезаписывались, а соединялись в один
        }),
      ),
    )
    .pipe(gulpif(dist || build, gulp.dest(distFolder.baseDir)))
    .pipe(gulpif(dev, browserSync.stream()));
}

function watch(cb) {
  browserSync.init({
    server: {
      baseDir: config.dev.baseDir,
    },
    tunnel: config.tunnel,
  });
  gulp.watch(config.watch.sass, styles);
  gulp.watch(config.watch.js, scripts);
  gulp.watch(config.watch.html, layout);
  gulp.watch(config.watch.img, images);
  gulp.watch(config.watch.svg, svg);
  gulp.watch(config.watch.fonts, fonts);
  gulp.watch(config.watch.icons, gulp.series('sprite'));
  gulp.watch(config.watch.htmlElements, () => panini.refresh());
  cb();
}
