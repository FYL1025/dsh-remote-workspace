# 🖥️ dsh-remote-workspace

[![License: MIT](https://img.shields.io/github/license/FYL1025/dsh-remote-workspace)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green)](https://nodejs.org)
[![DSH Plugin](https://img.shields.io/badge/DSH-plugin-blue)](https://github.com/deepseek-ai/deepseek-harness)
[![Type](https://img.shields.io/badge/type-module-blueviolet)](https://nodejs.org/api/esm.html)
[![Code Size](https://img.shields.io/github/languages/code-size/FYL1025/dsh-remote-workspace)](https://github.com/FYL1025/dsh-remote-workspace)
[![npm version](https://img.shields.io/badge/npm-pending-lightgrey)](https://www.npmjs.com)

**English** | [简体中文](README.zh.md)

---

**Remote Workspace for DeepSeek Harness (DSH)** — connect to one or more servers over SSH and browse files, edit code, and run commands directly in the DSH web UI. A Remote-SSH experience without leaving the conversation.

## ✨ Features

- **Multi-server connection management** (Settings → Remote Workspace): SSH alias (`~/.ssh/config` Host) or host/port/user modes; switch connections anytime; config persists in browser localStorage
- **🔌 Connect / ⏹ Disconnect**: verify and hold/release the active server's connection state with one click
- **File tree browser**: lazy-loaded expand/collapse, hidden-files toggle, per-type icons, one-click copy path
- **Code editor**: line numbers + 👁 syntax-highlight preview (keywords/strings/comments/numbers/decorators) + ✏️ edit and save back to the server
- **Command runner**: run any command on the server (working directory follows the open file)
- **Dock / Float dual modes**: docked beside the conversation (conversation reflows, draggable divider) / wide floating panel (up to 1400px)
- **Conversation-direct**: ask the agent in chat to operate on server files directly

## 📦 Install

```bash
# SSH (recommended, port 22)
dsh plugin --profile web add git+ssh://git@github.com/FYL1025/dsh-remote-workspace.git

# or HTTPS (port 443)
dsh plugin --profile web add git+https://github.com/FYL1025/dsh-remote-workspace.git
```

**Restart DSH** after install, then open **Settings → Remote Workspace**.

## ⚠️ Prerequisites: SSH passwordless login (important)

The plugin uses your **local SSH client** to reach servers, so **key-based passwordless login** must be configured first:

1. **Check for an existing key** — `ls ~/.ssh/` — or generate one: `ssh-keygen -t ed25519 -C "you@example.com"`
2. **Add the public key to the server**:
   ```bash
   ssh-copy-id -p <port> <user>@<server>       # Linux/macOS
   # or manually: append ~/.ssh/id_ed25519.pub to the server's ~/.ssh/authorized_keys
   ```
3. **(Recommended) Define an alias** in `~/.ssh/config` (Windows: `C:\Users\<you>\.ssh\config`):
   ```
   Host myserver
     HostName <server-ip>
     User <user>
     Port <port>
   ```
4. **Verify** — `ssh myserver` should log in **without asking for a password**.

## 🔒 Security note

- The plugin runs ssh commands with a **danger-full-access** policy — equivalent to you running ssh yourself in a terminal; limited to commands issued by this plugin.
- Connection settings (alias/host/port/user) are stored in browser localStorage; **no passwords or private keys** are ever stored.

## ❓ FAQ

| Issue | Fix |
| --- | --- |
| ❌ Connection failed | Check host/port/user; confirm passwordless login works (`ssh <alias>`); retry |
| Permission denied (publickey) | Public key not on the server — run `ssh-copy-id` or append to `authorized_keys` |
| Large file rejected | The plugin reads text files ≤ 2MB; ask the agent in chat for bigger files |

## 📄 License

MIT
