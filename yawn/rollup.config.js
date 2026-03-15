import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import visualizer from 'rollup-plugin-visualizer';

/** @type {import('rollup').RollupOptions[]} */
export default {
  input: {
    index: 'src/index.ts',
    'jsx/jsx-runtime': 'src/jsx/jsx-runtime.ts',
    'jsx/jsx-dev-runtime': 'src/jsx/jsx-dev-runtime.ts',
  },
  output: {
    dir: 'dist',
    format: 'esm',
    entryFileNames: '[name].js',
    sourcemap: true,
  },
  plugins: [
    typescript(),
    resolve(),
    terser(),
    visualizer({ filename: 'bundle-stats.html', sourcemap: true, template: 'treemap' }),
  ],
}
