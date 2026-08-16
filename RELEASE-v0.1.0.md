# 🖥️ dsh-remote-workspace v0.1.0

**English | 中文**

---

## English

**Remote Workspace for DeepSeek Harness (DSH)** — connect to one or more servers over SSH and browse files, edit code, and run commands directly in the DSH web UI. A Remote-SSH experience without leaving the conversation.

### ✨ Features

- Multi-server connection management (SSH alias or host/port/user; persists in localStorage)
- 🔌 Connect / ⏹ Disconnect state management
- File tree browser: lazy expand/collapse, hidden-files toggle, per-type icons, copy path
- Code editor: line numbers + 👁 syntax-highlight preview + ✏️ edit & save back to server
- Command runner (working directory follows the open file)
- Dock / Float dual modes (docked beside conversation, reflowable / wide floating up to 1400px)
- Conversation-direct: ask the agent to operate on server files in chat

### 📦 Install

```bash
# SSH (recommended, port 22)
dsh plugin --profile web add git+ssh://git@github.com/FYL1025/dsh-remote-workspace.git

# or HTTPS (port 443)
dsh plugin --profile web add git+https://github.com/FYL1025/dsh-remote-workspace.git
```

Restart DSH after install, then open **Settings → Remote Workspace**.

### ⚠️ Prerequisites

- SSH **passwordless login** configured for your servers (see README: `ssh-keygen` → add public key to the server's `~/.ssh/authorized_keys` → optional `~/.ssh/config` alias)
- **pnpm** installed; profile name usually `web`

### 🔒 Security note

- ssh commands run with a **danger-full-access** policy — equivalent to running ssh yourself; limited to commands issued by this plugin.
- Connection settings stay in browser localStorage; **no passwords or private keys** are stored.

### 📄 License

MIT

---

## 中文

**DeepSeek Harness (DSH) 远程工作区插件**：通过 SSH 连接一台或多台服务器，直接在 DSH 的 Web 界面里浏览文件、编辑代码、执行命令——体验类似 VS Code Remote-SSH。

### ✨ 功能

- 多服务器连接管理（SSH 别名 / 主机端口 两种方式，浏览器本地保存）
- 🔌 连接 / ⏹ 断开 状态管理
- 文件树浏览器（懒加载、隐藏文件开关、类型图标、复制路径）
- 代码编辑器：行号 + 👁 语法高亮预览 + ✏️ 编辑保存
- 命令执行框（工作目录跟随当前文件）
- 贴合 / 加宽 双模式（与对话并排 / 宽屏浮动 1400px）
- 对话直连（让智能体直接操作服务器文件）

### 📦 安装

```bash
# SSH 方式（推荐，端口 22）
dsh plugin --profile web add git+ssh://git@github.com/FYL1025/dsh-remote-workspace.git

# 或 HTTPS 方式（端口 443）
dsh plugin --profile web add git+https://github.com/FYL1025/dsh-remote-workspace.git
```

安装后**重启 DSH**，打开 **设置 → 远程工作区** 即可使用。

### ⚠️ 前置要求

- 已配置对目标服务器的 **SSH 免密登录**（详见 README：`ssh-keygen` 生成密钥 → 公钥追加到服务器的 `~/.ssh/authorized_keys` → 可选在 `~/.ssh/config` 配置别名）
- 本机已安装 **pnpm**；profile 名通常是 `web`

### 🔒 安全说明

- 插件执行的 ssh 命令以**全访问（danger-full-access）**策略运行，等价于用户自己在终端里执行 ssh，仅限本插件发起的命令
- 连接配置保存在浏览器 localStorage，**不含任何密码或私钥**

### 📄 License

MIT
