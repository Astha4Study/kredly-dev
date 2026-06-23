import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/rspack';
import { pluginImageCompress } from '@rsbuild/plugin-image-compress';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, 'server/.env') });

const apiUrl = process.env.API_URL || 'http://localhost:8080';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [
    pluginReact(),
    pluginSvgr(),
    pluginImageCompress(),
    pluginBabel({
      include: /\.[jt]sx?$/,
      exclude: [/[\\/]node_modules[\\/]/],
      babelLoaderOptions(opts) {
        opts.plugins?.unshift('babel-plugin-react-compiler');
      },
    }),
  ],
  tools: {
    rspack: {
      plugins: [
        tanstackRouter({
          target: 'react',
          autoCodeSplitting: true,
        }),
      ],
    },
  },
  output: {
    injectStyles: false,
  },
  server: {
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true,
      },
    },
  },
});
