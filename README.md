# Looki Plugin

Connect supported AI assistants to Looki through an OAuth-authenticated MCP
server and bundled agent skills.

## 1. Open Plugin

Use the Open Plugin installer to detect compatible AI clients on the current
machine and choose where to install Looki:

```bash
npx plugins add looki-ai/looki-plugin
```

To install Looki for a specific client, pass its target ID:

```bash
npx plugins add looki-ai/looki-plugin --target <target>
```

Supported target IDs:

- `claude-code`: Claude Code
- `cursor`: Cursor
- `codex`: Codex
- `grok`: Grok Build
- `kimi`: Kimi Code
- `github-copilot`: GitHub Copilot CLI
- `vscode`: Visual Studio Code

### Agents supported

| Vendor | Supported |
| --- | --- |
| Claude Code | ✓ |
| Cursor | ✓ |
| Codex | ✓ |
| GitHub Copilot | ✓ |
| Gemini | ✓ |
| VS Code (Open Plugin) | ✓ |
| Kimi Code | ✓ |
| Grok Build | ✓ |

## 2. Official Installation Methods

### Gemini CLI

Install the extension from GitHub with the official Gemini CLI command:

```bash
gemini extensions install https://github.com/looki-ai/looki-plugin
```

### Claude Code

Add the Looki repository as a Claude Code marketplace, then install the plugin:

```bash
claude plugin marketplace add looki-ai/looki-plugin
claude plugin install looki-plugin@looki
```

Run `/reload-plugins` inside Claude Code after installation.

### Codex

Open Codex and enter `/plugins`, then find Looki in the configured marketplace
and select **Install plugin**. Start a new Codex session after installation.

### Cursor

```bash
git clone https://github.com/looki-ai/looki-plugin \
  ~/.cursor/plugins/local/looki-plugin
```

Reload Cursor after installation.

### GitHub Copilot CLI

```bash
copilot plugin install looki-ai/looki-plugin
```

Restart GitHub Copilot CLI after installation.

### Grok Build

```bash
grok plugin install looki-ai/looki-plugin
```

Restart Grok Build after installation.

### Kimi Code

Start Kimi Code, then run:

```text
/plugins install https://github.com/looki-ai/looki-plugin
```

Confirm the trust prompt, then run `/reload`.

### Visual Studio Code

Open the Command Palette and run `Chat: Install Plugin From Source`. Enter
`https://github.com/looki-ai/looki-plugin`, review the trust prompt, and finish
the installation.

## 3. Authentication

Authenticate Looki separately in every client where the plugin is installed:

| Client | Authentication |
| --- | --- |
| Claude Code | Run `/mcp`, select `looki`, choose **Authenticate**, and complete browser OAuth. |
| Codex | Open Looki from `/plugins`, select **Connect**, and complete browser OAuth. |
| Cursor | Open **Customize > MCP**, select `looki`, and complete browser OAuth. |
| Gemini CLI | Run `/mcp auth looki`, complete browser OAuth, then use `/mcp` to verify the connection. |
| GitHub Copilot CLI | Run `/mcp`, select `looki`, and complete browser OAuth. |
| Grok Build | Run `/mcps`, select the `looki-plugin` MCP server, and complete browser OAuth. |
| Kimi Code | Run `/mcp-config login looki`, complete browser OAuth, then use `/mcp` to verify the connection. |
| Visual Studio Code | Start the Looki MCP server and complete browser OAuth when prompted. Use **MCP: List Servers** to verify its status. |

Each client stores its own OAuth credentials. Authentication in one client does
not authenticate another. The plugin does not request or store credentials.

## 4. Bundled Skills

- `looki-memory`: browse and search captured moments and moment files.
- `looki-profile`: retrieve the authenticated user's Looki profile.
- `looki-realtime`: retrieve the latest supported realtime device event.
