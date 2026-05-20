/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2025 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

/// <reference types="node" />

import { fileURLToPath } from 'node:url';

import { defineConfig, UserConfig } from 'vite';

import { baseConfigurationPlugin } from '@cloudbeaver/product-base';

import packageJson from './package.json';

export default defineConfig(
  ({ mode }): UserConfig => ({

    base: './',

    resolve: {
      alias: [
        {
          find: '@cloudbeaver/core-blocks/module',
          replacement: fileURLToPath(new URL('../core-blocks/src/module.ts', import.meta.url)),
        },
        {
          find: '@cloudbeaver/core-blocks',
          replacement: fileURLToPath(new URL('../core-blocks/src/index.ts', import.meta.url)),
        },
      ],
    },

    plugins: [
      baseConfigurationPlugin(mode, packageJson)
    ],

    server: {

      port: 8080,

      proxy: {

        '/api': {
          target: 'http://localhost:8978',
          changeOrigin: true,
          secure: false,
        },

        '/api/ws': {
          target: 'ws://localhost:8978',
          ws: true,
          changeOrigin: true,
          secure: false,
        },

        '/auth-external': {
          target: 'http://localhost:8978',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }),
);
