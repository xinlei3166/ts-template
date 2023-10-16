import path from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import buble from '@rollup/plugin-buble'
import commonjs from '@rollup/plugin-commonjs'
import node from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import { defineConfig } from 'rollup'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)).toString())
const moduleName = pkg.name
const version = process.env.VERSION || pkg.version
const resolve = (dir: string) => path.resolve(__dirname, '../', dir)

const banner =
  '/**\n' +
  ` * ${moduleName} v${version}\n` +
  ` * (c) 2023-present ${pkg.author}\n` +
  ' * Released under the MIT License.\n' +
  ' */'

function genConfig(input: string, name?: string) {
  return defineConfig({
    input: resolve(input),
    external: [...Object.keys(pkg.dependencies || {})],
    plugins: [
      typescript({
        exclude: 'node_modules/**',
        compilerOptions: {
          target: 'es5',
          module: 'esnext'
        }
      }),
      node(),
      commonjs(),
      json(),
      terser(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      buble({
        objectAssign: 'Object.assign',
        transforms: {
          arrow: true,
          dangerousForOf: true,
          generator: false
        }
      })
    ],
    output: {
      dir: resolve('dist'),
      entryFileNames: '[name].min.js',
      format: 'umd',
      exports: 'auto',
      banner,
      name: name || moduleName
    },
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg as any)) {
        warn(msg)
      }
    }
  })
}

export default genConfig('src/index.ts')
