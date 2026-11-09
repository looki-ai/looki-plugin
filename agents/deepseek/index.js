import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)

export const name = 'looki-plugin'

export function apply(ctx) {
  ctx.provide('lookiPlugin', {
    node: process.execPath,
    proxy: require.resolve('mcp-remote/dist/proxy.js'),
    skillsDir: fileURLToPath(new URL('../../skills/', import.meta.url)),
  })
}
