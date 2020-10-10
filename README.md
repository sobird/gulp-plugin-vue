# gulp-plugin-vue
Gulp plugin for compiling Vue single file components

## Usage

```js
const { src, dest } = require('gulp');
const gulpPluginVue = require('gulp-plugin-vue');

// gulp plugin
src('src/*.vue')
.pipe(gulpPluginVue())
.pipe(dest('output'));
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