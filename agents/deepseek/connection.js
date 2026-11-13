import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export function createConnection(ctx, config) {
  const loader = ctx.reflect.get('loader', false)
  let disposed = false
  let busy = false
  let managed
  let managerHandle
  let legacyHandle
  let legacyStatus
  let mode = 'pending'
  let status = {
    state: 'connecting',
    code: 'initializing',
    message: 'Looki is initializing in the background.',
    nextStep: 'Wait for the connection. Installation alone does not confirm login.',
  }

  function fail(code, message, nextStep) {
    if (disposed) return
    status = { state: 'failed', code, message, nextStep }
    ctx.logger.warn(`Looki: ${message} ${nextStep}`)
  }

  function snapshot() {
    if (disposed) return { state: 'closed', code: 'unloaded', message: 'Looki is unloaded.', nextStep: '', canRetry: false, mode }
    const live = busy || status.code === 'cleanup_failed' ? undefined : managed?.list().find(server => server.name === 'looki')?.status ?? legacyStatus?.current()
    if (live?.state === 'connected') {
      status = { state: 'connected', code: 'ready', message: 'Looki is connected and ready to use.', nextStep: '' }
    } else if (live?.state === 'failed' || live?.state === 'closed') {
      const cleanupFailed = live.reason === 'cleanup' || live.reason === 'unclosed-generation'
        || live.result?.closeConfirmed === false || live.result?.cleanupError !== undefined
      status = {
        state: 'failed',
        code: cleanupFailed ? 'cleanup_failed' : 'connection_failed',
        message: cleanupFailed ? 'The previous Looki connection could not be closed safely.' : 'Looki could not connect. Bridge startup, network, and authorization failures cannot be reliably distinguished.',
        nextStep: cleanupFailed ? 'Restart DeepSeek Harness before reconnecting.' : 'Check your network and any browser authorization page, then ask to retry Looki. No credentials need to be deleted.',
      }
    } else if (live) {
      status = {
        state: 'connecting', code: live.state,
        message: 'Looki is connecting in the background.',
        nextStep: 'Complete the browser authorization if it opens. A connection attempt is not proof of successful login.',
      }
    }
    return { ...status, canRetry: !busy && status.state !== 'connecting' && status.code !== 'cleanup_failed', mode }
  }

  async function initialize() {
    await ctx.fiber.await()
    await loader.await()
    if (disposed) return
    let proxy
    try {
      proxy = require.resolve('mcp-remote/dist/proxy.js')
    } catch {
      fail('missing_dependency', 'The Looki OAuth bridge is not installed.', 'For a locally linked plugin, run npm install --no-package-lock in the plugin repository, then retry Looki. For a packaged installation, reinstall the plugin.')
      return
    }
    const server = {
      transport: 'stdio', command: process.execPath,
      args: [
        proxy, config.mcpUrl, '--transport', 'http-only',
        '--auth-timeout', '300', '--auth-success-url', config.authSuccessUrl,
        '--static-oauth-client-metadata',
        JSON.stringify({ client_name: 'DeepSeek Harness', client_uri: 'https://github.com/deepseek-ai/deepseek-harness', scope: 'read' }),
      ],
      env: { ELECTRON_RUN_AS_NODE: '1' },
      reconnect: { enabled: false },
    }
    const manager = ctx.reflect.get('mcpManager', false)
    if (typeof manager?.register === 'function') {
      mode = 'manager'
      managerHandle = ctx.inject(['mcpManager'], scope => {
        try {
          scope.mcpManager.register('looki', { ...server, startupTimeoutMs: 360000 })
          managed = scope.mcpManager
          scope.effect(() => () => {
            managed = undefined
            if (!disposed) status = { state: 'connecting', code: 'manager_unavailable', message: 'Waiting for the Harness MCP manager.', nextStep: 'If it does not recover, restart DeepSeek Harness.' }
          })
        } catch {
          fail('registration_failed', 'Looki could not register its MCP service.', 'Check the MCP configuration and any conflicting service named looki, then retry Looki.')
        }
      })
      await managerHandle.await()
    } else {
      mode = 'legacy'
      const client = await loader.import('@deepseek-ai/dsh-mcp-client')
      if (disposed) return
      legacyHandle = ctx.plugin(loader.unwrapExports(client), { ...server, serverName: 'looki', failOnStartupError: true })
      legacyStatus = typeof client.connectionStatusOf === 'function' ? client.connectionStatusOf(legacyHandle) : undefined
      await legacyHandle.await()
      if (!disposed) {
        legacyStatus = client.connectionStatusOf?.(legacyHandle)
        status = {
          state: 'connected', code: 'ready', message: 'The initial Looki connection succeeded.',
          nextStep: legacyStatus ? '' : 'This Harness version has no live MCP status API. If a Looki tool fails later, check the connection and ask to retry Looki.',
        }
      }
    }
  }

  function start(retry = false) {
    if (disposed || busy) return
    busy = true
    status = { state: 'connecting', code: 'initializing', message: 'Looki is connecting in the background.', nextStep: 'Complete the browser authorization if it opens. Wait before retrying.' }
    const operation = async () => {
      if (retry && managed) {
        await managed.restart('looki')
        return
      }
      if (retry) {
        await managerHandle?.dispose()
        await legacyHandle?.dispose()
        managerHandle = undefined
        legacyHandle = undefined
        legacyStatus = undefined
      }
      if (!disposed) await initialize()
    }
    operation().catch(() => {
      fail(retry ? 'cleanup_failed' : 'connection_failed', retry ? 'Looki could not safely restart its connection.' : 'Looki could not initialize its MCP connection.', retry ? 'Restart DeepSeek Harness before reconnecting.' : 'Check the plugin installation, network, and browser authorization, then retry Looki. Do not delete OAuth credentials automatically.')
    }).finally(() => { busy = false })
  }

  ctx.effect(() => () => { disposed = true })
  return {
    snapshot,
    start,
    retry() {
      if (snapshot().canRetry) start(true)
      return snapshot()
    },
  }
}
