import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import rollup from 'rollup';

let pkg = require('./package.json');
let clikeMode = require('./node_modules/codemirror/mode/clike/clike.js');

export default {
  entry: 'dist/apex.js',
  plugins: [
    babel(babelrc({ path: '.rollup.babelrc' })),
  ],
  targets: [
    {
      dest: pkg['main'],
      format: 'umd',
      moduleName: 'registerApexMode'
    },
    {
      dest: pkg['jsnext:main'],
      format: 'es'
    },
    {
      dest: clikeMode,
      format: 'umd',
      moduleName: 'getCLikeMode'
    }
  ]
};
