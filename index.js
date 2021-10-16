/**
 * gulp-plugin-vue
 * Gulp plugin for compiling Vue single file components
 * 
 * @see https://github.com/vuejs/vue-loader
 * @see https://github.com/vuejs/component-compiler-utils
 * @see https://github.com/vuejs/vue/tree/dev/packages/vue-template-compiler
 * 
 * sobird<i@sobird.me> at 2020/10/10 13:12:44 created.
 */

const through = require('through2');
const hash = require('hash-sum');
const log = require('loglevel');
const { parse, compileTemplate, compileStyle } = require('@vue/component-compiler-utils');
const compiler = require('vue-template-compiler');
const vfs = require('vinyl-fs');

module.exports = function (options) {
  options = Object.assign({
    runtime: true,
    outputSourceRange: false
  }, options);

  return through.obj(async function (file, encoding, callback) {
    // ignore empty files
    if (file.isNull()) {
      callback();
      return;
    }
    // we don't do streams (yet)
    if (file.isStream()) {
      this.emit('error', new Error('gulp-plugin-vue: Streaming not supported'));
      callback();
      return;
    }

    let contents = file.contents.toString();
    let filename = file.relative;
    let sourceRoot = file.base;

    let descriptor = parse({
      source: contents,
      filename,
      compiler,
      // https://github.com/vuejs/vue/tree/dev/packages/vue-template-compiler#compilerparsecomponentfile-options
      compilerParseOptions: { pad: 'line' },
      sourceRoot,
      needMap: true
    });

    const scopeId = `data-v-${hash(filename)}`;

    const scoped = descriptor.styles.some(s => s.scoped);
    const isFunctional = descriptor.template && descriptor.template.attrs.functional;

    let script = [];
    let styles = [];

    // script
    if (descriptor.script) {
      // todo 需要babel处理
      script.push(descriptor.script.content);
    } else {
      script.push('module.exports = {};');
    }

    script.push('var __vue__options__;');
    script.push('if (exports && exports.__esModule && exports.default) {');
    script.push('  __vue__options__ = exports.default;');
    script.push('} else {');
    script.push('  __vue__options__ = module.exports;');
    script.push('}');
    script.push(`__vue__options__.__file = ${JSON.stringify(filename)};`);
    // template
    if (descriptor.template) {
      if (options.runtime) {
        /**
         * Compiles a template string and returns compiled JavaScript code. 
         * The returned result is an object of the following format:
         * {
         *   ast: ?ASTElement, // parsed template elements to AST
         *   render: string, // main render function code
         *   staticRenderFns: Array<string>, // render code for static sub trees, if any
         *   errors: Array<string> // template syntax errors, if any
         *   tips: Array<string>
         * }
         */
        let compiled = compileTemplate({
          source: descriptor.template.content,
          filename,
          compiler,
          isFunctional
        });

        // tips
        if (compiled.tips && compiled.tips.length) {
          compiled.tips.forEach(tip => {
            log.warn(typeof tip === 'object' ? tip.msg : tip);
          })
        }

        // errors
        if (compiled.errors && compiled.errors.length) {
          // 2.6 compiler outputs errors as objects with range
          if (compiler.generateCodeFrame && options.outputSourceRange) {
            // TODO account for line offset in case template isn't placed at top
            // of the file
            log.error(
              `\n\n  Errors compiling template:\n\n` +
              compiled.errors.map(({ msg, start, end }) => {
                const frame = compiler.generateCodeFrame(source, start, end)
                return `  ${msg}\n\n${pad(frame)}`
              }).join(`\n\n`) +
              '\n'
            )
          } else {
            log.error(
              `\n  Error compiling template:\n${pad(compiled.source)}\n` +
              compiled.errors.map(e => `  - ${e}`).join('\n') +
              '\n'
            )
          }
        }

        script.push(compiled.code);

        script.push('__vue__options__.render = render;');
        script.push('__vue__options__.staticRenderFns = staticRenderFns;');
        script.push('__vue__options__._compiled = true;');
      } else {
        script.push('__vue__options__.template = ' + JSON.stringify(descriptor.template.content) + ';');
      }
    }

    if (isFunctional) {
      script.push('__vue__options__.functional = true;');
    }

    if(scoped) {
      script.push('__vue__options__._scopeId = ' + JSON.stringify(scopeId) + ';');
    }

    // style
    for (let style of descriptor.styles) {
      if (style.content && !/^\s*$/.test(style.content)) {
        const styled = compileStyle({
          source: style.content,
          filename,
          id: scopeId,
          //map: inMap,
          scoped,
          trim: true,
          preprocessLang: style.lang || "css"
        });

        if (styled.errors && styled.errors.length) {
          log.error(
            `\n  Error compiling style:\n` +
            styled.errors.map(e => `  - ${e}`).join('\n') +
            '\n'
          )
        }

        styles.push(styled.code);
      }
    }

    // 同名样式文件
    if (styles.length) {
      let styleFile = file.clone();
      styleFile.contents = Buffer.from(styles.join('\n'));
      styleFile.extname = '.css';

      this.push(styleFile);
    }

    // 同名脚本文件
    file.contents = Buffer.from(script.join('\n'));
    file.extname = '.js';

    callback(null, file);
  }, function(callback) {
    // todo 
    callback();
  });
}

function pad(source) {
  return source
    .split(/\r?\n/)
    .map(line => `  ${line}`)
    .join('\n')
}
