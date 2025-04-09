export default {
  tunnel: false, // Транслирование верстки в сеть (Если true - Во время запущенной команды watch ("gulp" без параметров) верстка будет доступна в сети по IP, который отобразится в консоли при запуске)

  folders: [
    //  Каталоги для исходников
    'src',
    'src/html',
    'src/html/pages',
    'src/html/data',
    'src/html/layouts',
    'src/html/partials',
    'src/js',
    'src/sass',
    'src/img',
    'src/img/svg',
    'src/icons',
    'src/fonts',
    'src/resources',
  ],
  src: {
    //  Пути для исходников
    path: 'src/html/',
    html: 'src/html/pages/*.html',
    htmlFilterBlocks: '!src/html/{data,helpers,layouts,partials}/**/*.*',
    js: 'src/js/index.js',
    sass: ['src/sass/main.s+(a|c)ss', 'src/sass/second.s+(a|c)ss'],
    img: 'src/img/**/*.{jpg,jpeg,png}',
    icons: 'src/icons/**/*.png',
    svg: 'src/img/svg/**/*.svg',
    fonts: 'src/fonts/**/*.*',
  },
  watch: {
    //  Файлы, за которыми следит watch
    html: 'src/html/**/*.{html,json}',
    htmlElements: 'src/html/{data,helpers,layouts,partials}/**/*.*',
    js: 'src/js/**/*.js',
    sass: 'src/sass/**/*.{sass,scss,css}',
    img: 'src/img/**/*.{jpg,jpeg,png}',
    icons: 'src/icons/**/*.png',
    svg: 'src/img/svg/**/*.svg',
    fonts: 'src/fonts/**/*.*',
  },
  dev: {
    // Каталог для разработки
    baseDir: 'dev',
    html: 'dev',
    css: 'dev/css',
    js: 'dev/js',
    fonts: 'dev/fonts',
    img: 'dev/img',
    svgSprite: 'dev/img',
    resources: 'dev/resources',
  },
  dist: {
    // Каталог для демострации
    baseDir: 'dist',
    html: 'dist',
    css: 'dist/css',
    js: 'dist/js',
    fonts: 'dist/fonts',
    img: 'dist/img',
    svgSprite: 'dist/img',
    resources: 'dist/resources',
  },
  build: {
    // Каталог для билда
    baseDir: 'build',
    html: 'build',
    css: 'build/css',
    js: 'build/js',
    fonts: 'build/fonts',
    img: 'build/img',
    svgSprite: 'build/img',
    resources: 'build/resources',
  },

  spritesmithOptopns: {
    // Настройки спрайтов
    imgName: 'icons-sprite.png',
    retinaImgName: 'icons-sprite@2x.png',
    imgPath: '../img/icons-sprite.png',
    retinaImgPath: '../img/icons-sprite@2x.png',
    retinaSrcFilter: 'src/icons/**/*@2x.png',
    cssName: 'icons.css',
    padding: 2,
  },

  htmlhintHtml: {
    // Правила для HTML линтера
    'tagname-lowercase': true, //  Все имена элементов html должны быть в нижнем регистре.
    'attr-lowercase': true, //  Все атрибуты должны быть в нижнем регистре.
    'attr-value-double-quotes': true, //  Значения атрибутов должны быть в двойных кавычках.
    'attr-value-not-empty': false, //  Все атрибуты должны иметь значения.
    'attr-no-duplication': true, //  Атрибуты не должны дублироваться
    'tag-pair': true, //  Тег должен быть сопряжен. Т.е. не закрытые теги - нарушение
    'tag-self-close': true, //  Пустые теги должны быть самозакрывающимися.
    'id-unique': true, //  Значение атрибута id должно быть уникальным.
    'src-not-empty': true, //  Атрибут src img(скрипт, ссылка) должен иметь значение.
    'title-require': true, //  <title> должно присутствовать в <head> теге
    'alt-require': true, //  Атрибут alt элемента должен присутствовать, а атрибут alt области[href] и ввода[type=image] должен иметь значение.
    'doctype-html5': true, //  Недопустимый doctype.
    'style-disabled': true, //  <style> теги не могут быть использованы.
    'inline-style-disabled': true, //  Встроенный стиль нельзя использовать.
    'inline-script-disabled': false, //  Встроенный скрипт нельзя использовать.
    'space-tab-mixed-disabled': 'space', //  Не смешивайте табуляцию и пробелы для отступов.
    'id-class-ad-disabled': true, //  Атрибуты id и class не могут использовать ключевое слово ad, оно будет заблокировано программным обеспечением adblock.
    'href-abs-or-rel': true, //  Атрибут href должен быть либо абсолютным, либо относительным.
    'attr-unsafe-chars': true, //  Значения атрибутов не могут содержать небезопасных символов.
    'spec-char-escape': true, //  Специальные символы должны быть экранированы.
    'attr-no-unnecessary-whitespace': true, //  Нет пробелов между именами атрибутов и значениями.
  },

  beautifyHtml: {
    indent_size: 2,
    indent_char: ' ',
    max_preserve_newlines: -1,
    preserve_newlines: false,
    keep_array_indentation: false,
    break_chained_methods: false,
    indent_scripts: 'normal',
    brace_style: 'collapse',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: false,
    end_with_newline: false,
    wrap_line_length: 0,
    indent_inner_html: true,
    comma_first: false,
    e4x: false,
    indent_empty_lines: false,
  },
};
