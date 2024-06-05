/* eslint-disable */
const path = require('path')
const { resolve } = require('path')
/* eslint-enable */

module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  moduleNameMapper: {
    '^@shared/(.*)': resolve(__dirname, '../../shared/src/$1'),
    '^@/(.*)': resolve(__dirname, './src/$1'),
    "^axios$": "axios/dist/node/axios.cjs",
    '^@libsql/core/(.*)': resolve(__dirname, '../../node_modules/@libsql/core/lib-cjs/$1'),
  },
  transform: {
    '^.+\\.vue$': require.resolve('@vue/vue2-jest'),
  },
  setupFilesAfterEnv: [resolve(__dirname, './tests/setupTests.js')],
  setupFiles: ['./jest.polyfills.js'],
  testEnvironment: 'jest-environment-jsdom',
}
