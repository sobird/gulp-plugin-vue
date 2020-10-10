# gulp-plugin-vue
Gulp plugin for compiling Vue single file components

## Usage

`gulpfile.js`

```js
const { src, dest } = require('gulp');
const gulpPluginVue = require('gulp-plugin-vue');

module.exports.vue = function () {
  return src('./test/*.test.vue')
    .pipe(gulpPluginVue())
    .pipe(dest('output'));
}
```

```bash
$ gulp vue
```

## API
gulpPluginVue([options])

#### Options

- `runtime`
  - Type: `boolean`
  - Default: `true`

- `outputSourceRange`
  - Type: `boolean`
  - Default: `false`