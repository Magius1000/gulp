# Gulp template

**Собственная сборка Gulp, целью которой является удобство разработки оптимизированных HTML-шаблонов.**

Использует [SASS](https://github.com/dlmanning/gulp-sass#readme) для стилей, [webpack](https://github.com/webpack/webpack) для JS, [panini](https://github.com/foundation/panini#readme) для HTML. Все изображения автоматически сжимаются и преобразуются в формат [WebP](https://ru.wikipedia.org/wiki/WebP), иконки компонуются в png/WebP-спрайты, svg оптимизируются и собираются в svg-спрайты. На выходе вы получите два варианта:

- Оптимизированный минифицированный код, готовый к загрузке на хостинг.
- Оптимизированный не минифицированный код с sourcemaps, для дальнейшей интеграции в CMS или фреймворки.

Оба варианта разделены по каталогам + zip архив готовых файлов в каждом каталоге.

Для проверки HTML и CSS используются линтеры. Поэтому следите за сообщениями в консоли.

## Содержание

- [Установка и использование](#main)
  - [Установка](#install)
  - [Использование](#usage)
  - [Структура каталогов](#folders)
    - [Исходники](#src)
    - [Билды](#builds)
- [Особенности](#peculiarities)
  - [HTML сборка](#html)
  - [CSS сборка](#css)
  - [JS сборка](#js)
  - [Обработка изображений](#images)

## Установка и использование <a name="main"></a>

### Установка <a name="install"></a>

Для работы сборки вам потребуется **node**, **npm** или **npx**.

Установка **gulp-cli** не обязательна. Но для использования команды `gulp` потребуется:

`npm install --global gulp-cli`

_Тестировалось на версии node.js v20.18.3_

Копируйте репозиторий или копируйте файлы в каталог, где планируете разрабатывать проект. Выполните в этом каталоге следующие команды:
`npm install` - это установит все необходимые зависимости.
`gulp --init` или `npm run init` - Это создаст необходимые каталоги.

### Использование <a name="usage"></a>

Для запуска и разработки вам потребуется всего несколько команд:

- `gulp --init` или `npm run init`
    Удаляет все ранее созданные билды, создает каталог **dev** для дальнейшей разработки и все необходимые каталоги в **src**.
- `gulp` или `npm run dev`
    Основная команда. Запускает проект для локальной разработки на порту 3000 `http://localhost:3000` Для остановки достаточно в терминале нажать комбинацию `Ctrl+С` и подтвердить: `Y`
- `gulp --dist` или `npm run dist`
    Собирает проект в каталоге **dist** с оптимизированными картинками скриптами и стилями без минификации файлов HTML/CSS/JS для дальнейшей работы с версткой. Создает zip архив.
- `gulp --build` или `npm run build`
    Собирает проект в каталоге **build** с оптимизированными картинками и минифицированными скриптами и стилями. Создает zip архив.
- `gulp clear` или `npm run clear`
    Удаляет все ранее созданные билды и каталог dev.

### Структура каталогов <a name="folders"></a>

#### Исходники <a name="src"></a>

- `src` - Основной каталог для всех исходных файлов.
- `src/fonts` - Каталог для файлов шрифтов. Они будут просто копированы в `./fonts` проекта.
- `src/html` - Базовый каталог для исходников HTML.
- `src/html/data` - Для статичных данных в формате json или yml для наполнения страниц.
- `src/html/helpers` - Для функций-помощников.
- `src/html/layouts` - Для макетов страниц.
- `src/html/pages` - Для шаблонов конечных HTML-страниц. на основе этих файлов будут созданы итоговые страницы в корневом каталоге итогового проекта.
- `src/html/partials` - Для файлов с частями HTML-кода, который можно встраивать в страницы и многократно переиспользовать.
- `src/icons` - Для небольших png файлов, которые будут собраны в png и WebP спрайты и выгружены в каталог `./img/` проекта.
- `src/img` - Для прочих изображений. Файлы форматов jpg, jpeg и png будут преобразованы в WebP. Ссылки на них в HTML и CSS будут автоматически заменены.
- `src/img/svg` - Для svg файлов, которые будут собраны в svg спрайт и отправлены в каталог `./img/symbol/svg` проекта. Так же исходные файлы будут копированы в `./img/svg`.
- `src/js` - Для исходников js. Есть поддержка импортов. Базовый файл index.js.
- `src/resources` - Для прочих файлов. которые будут копированы в корневой каталог итогового проекта.
- `src/sass` - Для стилей. Поддерживает sass и scss.

#### Билды <a name="builds"></a>

- `dev` - Каталог для временного хранения файлов во время разработки.
- `dist` - Создается командами `gulp --dist` или `npm run dist` и содержит собранные но не минифицированные файлы + zip их архив.
- `build` - Создается командами `gulp --build` или `npm run build` и содержит собранные и минифицированные файлы + zip их архив.

## Особенности <a name="peculiarities"></a>

### HTML сборка <a name="html"></a>

Весь HTML собирается с помощью [panini](https://github.com/foundation/panini#readme) у которого под капотом [Handlebars](https://handlebarsjs.com/)
Шаблоны страниц создаем в `src/html/pages` они поддерживают:

1. **Переменные**.
   Переменные можно создать в области файла, отделенной символами `---`, а так-же в `src/html/data` в формате **json** или **yml**. Данные из этих файлов доступны в HTML по имени переменной, равной имени файла c данными. Для отображения переменной используются фигурные скобки `{{ varName }}`
2. **Итераторы**.
   Итераторы имеют вид `{{#each arrayName}}`. Текущий элемент итерируемого списка доступен через `this`. Например:

```html
{{#each posts}}
<article class="article">
  <h3 class="article__heading">{{ this.title }}</h3>
  <p>{{ this.text }}</p>
</article>
{{/each}}
```

3. **Условные операторы**.
   Условные операторы имеют вид `{{#if isActive}}`

```html
{{#if isActive}}
<div>Active data</div>
{{else}}
<div>Inactive data</div>
{{/if}}
```

4. **Импорт внешних файлов**.
   В любой файл шаблона можно подгрузить html код другого файла из каталога `src/html/partials`. Для этого достаточно указать лишь имя файла следующим образом: `{{> myPartial }}`
5. **Макет страницы**.
   Можно использовать несколько макетов. Имя необходимого для страницы макета нудно указать в блоке `---` вверху страницы в параметре с именем `layout:`
6. **Прочее**.
   Для изучения прочих возможностей, смотрите [документацию Handlebars](https://handlebarsjs.com/guide/#what-is-handlebars).

Пример кода страницы:

```html
---
layout: default
title: Demo page
heading: Start page demo
text: Lorem ipsum, dolor sit amet consectetur adipisicing elit.
---

<div class="wrapper">
  {{> header }}  
  <p>{{text}}</p>
   
  <div class="articles">
        {{#if posts}}     {{#each posts}}    
    <article class="article">
           
      <h3 class="article__heading">{{ this.title }}</h3>
           
      <p>{{ this.text }}</p>
         
    </article>
        {{/each}} {{else}}
    <p>No posts...</p>
    {{/if}}  
  </div>
</div>
```

При сборке проекта в **dist** или **build**, все теги `<img>` будут преобразованы в `<picture>` и к ним будет добавлен WebP формат файла картинки.
Например:

```html
<!-- В исходном файле: -->
<img class="poster" src="./img/zaiats.jpg" alt="jpg" />

<!-- Преобразуется в: -->
<picture>
  <source srcset="./img/zaiats.webp" type="image/webp" />
  <img class="poster" src="./img/zaiats.jpg" alt="jpg" />
</picture>
```

Линтер сообщит о допущенных грубых ошибках.

### CSS сборка <a name="css"></a>

Для работы со стилями вам потребуется знание препроцессора [SASS](https://github.com/dlmanning/gulp-sass#readme).
Для наилучшей оптимизации используется два базовых файла стилей **main** и **second**

- **main.sass(scss)**
  Подключается в разделе head страницы и предназначен для стилей, необходимых для первой отрисовки страницы. Например базовые стили, reset.css и стили для предзагрузчика.
- **second.sass(scss)**
  Подключается внизу страницы и предназначен для всех остальных стилей проекта.

Используется линтер, поэтому он не пропустит грубых ошибок. Во всех стилях автоматически будут прописаны URL на картинки в формате WebP для поддерживающих их браузеров.

#### Важно!

**В связи с тем, что скрипт автоматически заменяет фоновые картинки на WebP, это может перебить ваши стили для фона.** А именно, это происходит, если описать фон разделенными стилями:

```css
background: url(../img/truex.png) center no-repeat;
background-position: contain; /* background-position Будет перебит скриптом*/
```

Чтобы этого избежать используйте описание background в одну строку:

```css
background: url(../img/truex.png) center / contain no-repeat;
```

### JS сборка <a name="js"></a>

JavaScript собирается с [webpack](https://github.com/webpack/webpack). Входной файл index.js. Поддерживаются модули.

### Обработка изображений <a name="images"></a>

При сборке проекта в dist или build:

**Растровые изображения** из каталога `src/img` будут сжаты и для них созданы копии в формате WebP.

**Векторные изображения** из каталога `src/img/svg` будут перенесены как есть в `./img/svg` и кроме этого оптимизированные их версии будут упакованы в svg-спрайт по пути `./img/symbol/svg`. Для применения их в коде можно использовать:
`<svg><use xlink:href="/img/symbol/svg/sprite.symbol.svg#ИмяФайла"></use></svg>`

**PNG-иконки** из каталога `src/icons` будут оптимизированы и копированы в каталог `./img`, для них будут созданы версии в формате WebP.
Кроме того, эти иконки будут собраны в спрайты по пути `./img/icons-sprite.png` и `./img/icons-sprite.webp` а так же для ретина дисплеев `./img/icons-sprite@2x.png` и `./img/icons-sprite@2x.webp`.

Для того, чтобы были созданы версии **@2x**, в `src/icons` так же нужно положить версии файла большего разрешения с '@2x' в конце имени. Например `house.png` и `house@2x.png`.

А так же будет сформирован css файл вида `icons.css` благодаря чему вышеуказанные изображения можно использовать в верстке следующим образом:
`<i class="icon icon-fileName"></i>` где 'fileName' - имя файла изображения.
Их размер по умолчанию будет указан в соответствии с размером самого файла.
