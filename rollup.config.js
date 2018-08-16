// The MIT License
// Copyright (C) 2017-Present Shota Matsuda

import babel from 'rollup-plugin-babel'

import pkg from './package.json'

export default {
  input: './src/index.js',
  plugins: [
    babel()
  ],
  output: [
    {
      format: 'cjs',
      exports: 'named',
      file: pkg.main
    },
    {
      format: 'es',
      file: pkg.module
    },
    {
      format: 'umd',
      exports: 'named',
      name: 'ReduxCapture',
      file: pkg.browser[pkg.main]
    }
  ]
}
