# 🖥️ dsh-remote-workspace

[![License: MIT](https://img.shields.io/github/license/FYL1025/dsh-remote-workspace)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green)](https://nodejs.org)
[![DSH Plugin](https://img.shields.io/badge/DSH-plugin-blue)](https://github.com/deepseek-ai/deepseek-harness)
[![Type](https://img.shields.io/badge/type-module-blueviolet)](https://nodejs.org/api/esm.html)
[![Code Size](https://img.shields.io/github/languages/code-size/FYL1025/dsh-remote-workspace)](https://github.com/FYL1025/dsh-remote-workspace)
[![npm version](https://img.shields.io/badge/npm-pending-lightgrey)](https://www.npmjs.com)

**English** | [简体中文](README.zh.md)

> **Remote Workspace for DeepSeek Harness (DSH)** — browse files, edit code, and run commands on **one or more SSH servers** directly from the DSH web UI. Like VS Code Remote-SSH, without leaving the conversation.

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🥇 Why this plugin](#-why-this-plugin)
- [📦 Installation](#-installation)
- [🚀 Quick Start](#-quick-start)
- [⚠️ Prerequisites: SSH passwordless login](#-prerequisites-ssh-passwordless-login)
- [🔒 Security](#-security)
- [❓ FAQ](#-faq)
- [🤝 Feedback](#-feedback)
- [📄 License](#-license)

## ✨ Features

- **Multi-server connection management** (Settings → Remote Workspace): SSH alias (`~/.ssh/config` Host) or host/port/user modes; switch connections anytime; config persists in browser localStorage
- **🔌 Connect / ⏹ Disconnect**: verify and hold/release the active server's connection state with one click
- **File tree browser**: lazy-loaded expand/collapse, hidden-files toggle, per-type icons, one-click copy path
- **Code editor**: line numbers + 👁 syntax-highlight preview (keywords/strings/comments/numbers/decorators) + ✏️ edit and save back to the server
- **Command runner**: run any command on the server (working directory follows the open file)
- **Dock / Float dual modes**: docked beside the conversation (conversation reflows, draggable divider) / wide floating panel (up to 1400px)
- **Conversation-direct**: ask the agent in chat to operate on server files directly

## 🥇 Why this plugin?

Compared with other DSH SSH / remote-file-browser plugins:

- **Multi-server, not single-server** — add and switch any number of SSH connections (alias or host/port/user); most similar plugins hard-code one server
- **Zero-build, pure source** — no tsdown/typert build step; the published source *is* the running code, so it is easy to audit, fork, or extend
- **Dock / Float dual modes** — dock beside the conversation (auto-reflow + draggable divider) or one-click widen to a 1400px floating panel; other panels usually just overlay the page
- **Syntax highlighting + line numbers** — IDE-like code reading (keywords / strings / comments / numbers / decorators), not a plain textarea
- **Persistent config** — connection settings survive page refresh (localStorage)
- **Reuses your local SSH** — works with existing `~/.ssh/config` aliases and keys; no passwords are ever stored
- **Built-in command runner** — run commands in the panel; the working directory follows the open file
- **Conversation-direct** — pairs with DSH agents: you can also just say "edit this file on the server" in chat
- **Bilingual docs + MIT open source**

## 📦 Installation

**Requirements**: Node.js ≥ 18 · pnpm · a DSH profile (usually `web`)

```bash
# SSH (recommended, port 22)
dsh plugin --profile web add git+ssh://git@github.com/FYL1025/dsh-remote-workspace.git

# or HTTPS (port 443)
dsh plugin --profile web add git+https://github.com/FYL1025/dsh-remote-workspace.git
```

**Restart DSH** after install, then open **Settings → Remote Workspace**.

```bash
# Verify the plugin is registered
dsh plugin --profile web list

# Update after a new release
dsh plugin --profile web update dsh-remote-workspace

# Uninstall
dsh plugin --profile web remove dsh-remote-workspace
```

## 🚀 Quick Start

1. **Settings → Remote Workspace** → add your server (SSH alias or host/port/user) and select it as the active connection
2. Click **🔌 Connect** to verify connectivity (it flips to ⏹ Disconnect on success)
3. Click **📂 Open Workspace Panel** — the file browser appears beside the conversation
4. Expand directories, click a file:
   - **👁 Preview** — syntax highlighting
   - **✏️ Edit** — modify and click **Save** to write back to the server
5. Use the **command runner** at the bottom (e.g. `ls -la`, `python train.py`)
6. Click **⇔ Widen** for the wide floating panel; drag its edge to resize

## ⚠️ Prerequisites: SSH passwordless login (important)

The plugin uses your **local SSH client** to reach servers, so **key-based passwordless login** must be configured first:

1. **Check for an existing key** — `ls ~/.ssh/` — or generate one: `ssh-keygen -t ed25519 -C "you@example.com"` (press Enter for defaults)
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

## 🔒 Security

- The plugin runs ssh commands with a **danger-full-access** policy — equivalent to you running ssh yourself in a terminal; limited to commands issued by this plugin.
- Connection settings (alias/host/port/user) are stored in browser localStorage; **no passwords or private keys** are ever stored.

## ❓ FAQ

| Issue | Fix |
| --- | --- |
| ❌ Connection failed | Check host/port/user; confirm passwordless login works (`ssh <alias>`); retry |
| Permission denied (publickey) | Public key not on the server — run `ssh-copy-id` or append to `authorized_keys` |
| Large file rejected | The plugin reads text files ≤ 2MB; ask the agent in chat for bigger files |
| Panel not visible after restart | Hard-refresh the page (Ctrl+Shift+R); ensure the plugin is listed in `dsh plugin --profile web list` |

## 🤝 Feedback

Found a bug or have an idea? Open an [issue](https://github.com/FYL1025/dsh-remote-workspace/issues) — contributions are welcome.

## 📄 License

MIT
