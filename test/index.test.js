/**
 * test cases
 * 
 * sobird<i@sobird.me> at 2020/10/10 13:17:50 created.
 */

const { src, dest } = require('gulp');
const gulpPluginVue = require('../index');


src('./*.test.vue').pipe(gulpPluginVue()).pipe(dest('../output'));