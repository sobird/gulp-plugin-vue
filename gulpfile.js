const { src, dest } = require('gulp');
const gulpPluginVue = require('./index');

module.exports.vue = function () {
  return src('./test/*.test.vue').pipe(gulpPluginVue()).pipe(dest('output'));
}
