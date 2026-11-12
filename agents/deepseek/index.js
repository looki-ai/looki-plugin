import { fileURLToPath } from 'node:url'
import { createConnection } from './connection.js'

export const name = 'looki-plugin'

export function apply(ctx, config) {
  const connection = createConnection(ctx, config)
  ctx.provide('lookiPlugin', {
    skillsDir: fileURLToPath(new URL('../../skills/', import.meta.url)),
    connection,
  })
  ctx.inject(['tools'], scope => {
    scope.tools.register({
      name: 'looki_connection',
      description: 'Check Looki connection status without reading personal data before reporting installation or login success. Installation alone does not prove connection. Briefly report the status and necessary next step. Retry only when the user asks to connect or retry; retry may open browser authorization. Do not infer an OAuth failure without evidence or delete credentials automatically.',
      parameters: {
        type: 'object',
        properties: { action: { type: 'string', enum: ['status', 'retry'], description: 'Defaults to status. Use retry only at the user request.' } },
        additionalProperties: false,
      },
      output: { schema: { type: 'string' }, render: (args, value) => [{ type: 'text', text: value }] },
      execute(args, exec) {
        exec.signal.throwIfAborted()
        const action = args.action ?? 'status'
        if (action !== 'status' && action !== 'retry') throw new Error('Expected action status or retry')
        return JSON.stringify(action === 'retry' ? connection.retry() : connection.snapshot())
      },
    })
  })
  connection.start()
}
